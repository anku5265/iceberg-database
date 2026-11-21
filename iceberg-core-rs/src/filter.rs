use std::collections::{HashMap, HashSet};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct PayloadIndex {
    pub exact_map: HashMap<String, HashMap<String, HashSet<u32>>>,
}

impl PayloadIndex {
    pub fn new() -> Self {
        Self {
            exact_map: HashMap::new(),
        }
    }

    pub fn clear(&mut self) {
        self.exact_map.clear();
    }

    pub fn index_slot(&mut self, slot: u32, payload: &Value) {
        if let Value::Object(map) = payload {
            for (k, v) in map {
                match v {
                    Value::Array(arr) => {
                        for item in arr {
                            if let Some(sk) = scalar_key(item) {
                                self.exact_map
                                    .entry(k.clone())
                                    .or_default()
                                    .entry(sk)
                                    .or_default()
                                    .insert(slot);
                            }
                        }
                    }
                    _ => {
                        if let Some(sk) = scalar_key(v) {
                            self.exact_map
                                .entry(k.clone())
                                .or_default()
                                .entry(sk)
                                .or_default()
                                .insert(slot);
                        }
                    }
                }
            }
        }
    }

    pub fn remove_slot(&mut self, slot: u32, payload: &Value) {
        if let Value::Object(map) = payload {
            for (k, v) in map {
                if let Some(field_map) = self.exact_map.get_mut(k) {
                    match v {
                        Value::Array(arr) => {
                            for item in arr {
                                if let Some(sk) = scalar_key(item) {
                                    if let Some(set) = field_map.get_mut(&sk) {
                                        set.remove(&slot);
                                    }
                                }
                            }
                        }
                        _ => {
                            if let Some(sk) = scalar_key(v) {
                                if let Some(set) = field_map.get_mut(&sk) {
                                    set.remove(&slot);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /// Uses the inverted hash index to narrow down candidate slots in O(1) whenever
    /// namespace or top-level exact equality conditions are present.
    /// Returns `None` if no indexed equality condition is present (meaning all active slots are candidates).
    pub fn fast_candidates(
        &self,
        filter: Option<&Value>,
        namespace: Option<&str>,
    ) -> Option<HashSet<u32>> {
        let mut current: Option<HashSet<u32>> = None;

        if let Some(ns) = namespace {
            if !ns.is_empty() {
                let set = self
                    .exact_map
                    .get("_namespace")
                    .and_then(|m| m.get(&format!("s:{}", ns)))
                    .cloned()
                    .unwrap_or_default();
                current = Some(set);
            }
        }

        if let Some(Value::Object(map)) = filter {
            for (k, v) in map {
                if k.starts_with('$') {
                    continue;
                }
                let eq_key = match v {
                    Value::Object(op_map) if op_map.len() == 1 && op_map.contains_key("$eq") => {
                        scalar_key(&op_map["$eq"])
                    }
                    Value::Object(_) => None,
                    other => scalar_key(other),
                };
                if let Some(sk) = eq_key {
                    let set = self
                        .exact_map
                        .get(k)
                        .and_then(|m| m.get(&sk))
                        .cloned()
                        .unwrap_or_default();
                    current = Some(match current {
                        None => set,
                        Some(prev) => prev.intersection(&set).copied().collect(),
                    });
                    if let Some(ref c) = current {
                        if c.is_empty() {
                            return current;
                        }
                    }
                }
            }
        }

        current
    }

    pub fn namespace_counts(&self, deleted: &[bool]) -> HashMap<String, usize> {
        let mut counts = HashMap::new();
        if let Some(ns_map) = self.exact_map.get("_namespace") {
            for (k, slots) in ns_map {
                let clean_ns = k.strip_prefix("s:").unwrap_or(k);
                let active = slots
                    .iter()
                    .filter(|&&s| (s as usize) < deleted.len() && !deleted[s as usize])
                    .count();
                if active > 0 {
                    let label = if clean_ns.is_empty() {
                        "__default__".to_string()
                    } else {
                        clean_ns.to_string()
                    };
                    counts.insert(label, active);
                }
            }
        }
        counts
    }
}

fn scalar_key(v: &Value) -> Option<String> {
    match v {
        Value::String(s) => Some(format!("s:{}", s)),
        Value::Bool(b) => Some(format!("b:{}", b)),
        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                Some(format!("n:{}", i as f64))
            } else {
                                n.as_f64().map(|f| format!("n:{}", f))
            }
        }
        _ => None,
    }
}

/// Evaluates full recursive filter AST against a point's payload + namespace.
/// Supports flat equality AND rich operators ($eq, $ne, $gt, $gte, $lt, $lte, $in, $nin, $exists, $contains, $and, $or, $not).
pub fn matches_filter(
    payload: &Value,
    filter: Option<&Value>,
    namespace: Option<&str>,
) -> bool {
    if let Some(ns) = namespace {
        if !ns.is_empty() {
            let doc_ns = payload
                .get("_namespace")
                .and_then(|v| v.as_str())
                .unwrap_or("");
            if doc_ns != ns {
                return false;
            }
        }
    }

    let Some(flt) = filter else {
        return true;
    };

    eval_filter_node(payload, flt)
}

fn eval_filter_node(payload: &Value, node: &Value) -> bool {
    let Value::Object(map) = node else {
        return true;
    };
    if map.is_empty() {
        return true;
    }

    for (key, cond) in map {
        match key.as_str() {
            "$and" => {
                if let Value::Array(arr) = cond {
                    if !arr.iter().all(|sub| eval_filter_node(payload, sub)) {
                        return false;
                    }
                }
            }
            "$or" => {
                if let Value::Array(arr) = cond {
                    if !arr.iter().any(|sub| eval_filter_node(payload, sub)) {
                        return false;
                    }
                }
            }
            "$not" => {
                if eval_filter_node(payload, cond) {
                    return false;
                }
            }
            field => {
                let doc_val = get_nested_field(payload, field);
                if !eval_field_condition(doc_val, cond) {
                    return false;
                }
            }
        }
    }
    true
}

fn get_nested_field<'a>(payload: &'a Value, path: &str) -> Option<&'a Value> {
    if let Some(direct) = payload.get(path) {
        return Some(direct);
    }
    let mut cur = payload;
    for part in path.split('.') {
        cur = cur.get(part)?;
    }
    Some(cur)
}

fn eval_field_condition(doc_val: Option<&Value>, cond: &Value) -> bool {
    if let Value::Object(ops) = cond {
        let has_operator = ops.keys().any(|k| k.starts_with('$'));
        if has_operator {
            for (op, target) in ops {
                match op.as_str() {
                    "$eq" => {
                        if !values_equal_or_elem(doc_val, target) {
                            return false;
                        }
                    }
                    "$ne" => {
                        if values_equal_or_elem(doc_val, target) {
                            return false;
                        }
                    }
                    "$gt" => {
                        if !compare_num(doc_val, target, |a, b| a > b) {
                            return false;
                        }
                    }
                    "$gte" => {
                        if !compare_num(doc_val, target, |a, b| a >= b) {
                            return false;
                        }
                    }
                    "$lt" => {
                        if !compare_num(doc_val, target, |a, b| a < b) {
                            return false;
                        }
                    }
                    "$lte" => {
                        if !compare_num(doc_val, target, |a, b| a <= b) {
                            return false;
                        }
                    }
                    "$in" => {
                        if let Value::Array(targets) = target {
                            let matched = targets.iter().any(|t| values_equal_or_elem(doc_val, t));
                            if !matched {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                    "$nin" => {
                        if let Value::Array(targets) = target {
                            let matched = targets.iter().any(|t| values_equal_or_elem(doc_val, t));
                            if matched {
                                return false;
                            }
                        }
                    }
                    "$exists" => {
                        let want = target.as_bool().unwrap_or(true);
                        let exists = matches!(doc_val, Some(v) if !v.is_null());
                        if exists != want {
                            return false;
                        }
                    }
                    "$contains" => {
                        if !eval_contains(doc_val, target) {
                            return false;
                        }
                    }
                    _ => {}
                }
            }
            return true;
        }
    }

    values_equal_or_elem(doc_val, cond)
}

fn values_equal_or_elem(doc_val: Option<&Value>, target: &Value) -> bool {
    let Some(dv) = doc_val else {
        return target.is_null();
    };
    if values_scalar_eq(dv, target) {
        return true;
    }
    if let Value::Array(arr) = dv {
        return arr.iter().any(|item| values_scalar_eq(item, target));
    }
    false
}

fn values_scalar_eq(a: &Value, b: &Value) -> bool {
    if a == b {
        return true;
    }
    if let (Some(na), Some(nb)) = (a.as_f64(), b.as_f64()) {
        return (na - nb).abs() < 1e-9;
    }
    false
}

fn compare_num<F: Fn(f64, f64) -> bool>(doc_val: Option<&Value>, target: &Value, cmp: F) -> bool {
    let (Some(dv), Some(tv)) = (doc_val.and_then(|v| v.as_f64()), target.as_f64()) else {
        return false;
    };
    cmp(dv, tv)
}

fn eval_contains(doc_val: Option<&Value>, target: &Value) -> bool {
    let Some(dv) = doc_val else {
        return false;
    };
    match (dv, target) {
        (Value::String(s), Value::String(sub)) => {
            s.to_lowercase().contains(&sub.to_lowercase())
        }
        (Value::Array(arr), t) => arr.iter().any(|item| values_scalar_eq(item, t)),
        _ => false,
    }
}
