"""
Iceberg Connect Widget for Google Colab & Jupyter Notebooks (v1.0.0)
====================================================================
Renders an interactive Connect to Iceberg authentication widget directly inside
Google Colab / IPython notebooks and populates `os.environ["ICEBERG_API_KEY"]`.

Usage:
    from iceberg.colab import Authenticate
    Authenticate()
"""

import getpass
import os
from typing import Optional


def Authenticate(
    integration_id: str = "colab",
    dashboard_url: str = "https://dashboard.icebergdb.in",
    env_var: str = "ICEBERG_API_KEY",
) -> Optional[str]:
    """
    Render the Connect to Iceberg widget in Google Colab or Jupyter so the user
    can sign in, select a project/RBAC scope, and populate `ICEBERG_API_KEY`.
    """
    base = dashboard_url.rstrip("/")
    embed_url = f"{base}/connect?integration={integration_id}&embed=1"

    def _store_key(api_key: str) -> str:
        clean = str(api_key or "").strip()
        if clean:
            os.environ[env_var] = clean
        return clean

    # 1. Google Colab interactive callback path
    try:
        from google.colab import output as colab_output  # type: ignore
        from IPython.display import HTML, display  # type: ignore

        colab_output.register_callback("iceberg.set_api_key", _store_key)
        html = f"""
        <div style="max-width:480px;margin:8px 0;">
          <iframe
            id="iceberg-colab-connect"
            src="{embed_url}"
            style="width:100%;height:460px;border:1px solid #27272a;border-radius:12px;background:#0b0c10;"
            allow="clipboard-read; clipboard-write"
          ></iframe>
        </div>
        <script>
          window.addEventListener("message", function(ev) {{
            var d = ev.data || {{}};
            if ((d.type === "ICEBERG_API_KEY_CONNECTED" || d.type === "ICEBERG_CONNECT_SUCCESS") && d.apiKey) {{
              if (window.google && google.colab && google.colab.kernel) {{
                google.colab.kernel.invokeFunction("iceberg.set_api_key", [d.apiKey], {{}});
              }}
            }}
          }});
        </script>
        """
        display(HTML(html))
        return os.environ.get(env_var)
    except Exception:
        pass

    # 2. Standard Jupyter / IPython notebook path
    try:
        from IPython import get_ipython  # type: ignore
        from IPython.display import HTML, display  # type: ignore

        if get_ipython() is not None:
            display(
                HTML(
                    f'<iframe src="{embed_url}" style="width:100%;max-width:480px;height:460px;border:1px solid #27272a;border-radius:12px;background:#0b0c10;"></iframe>'
                )
            )
    except Exception:
        pass

    # 3. Non-Colab / CLI fallback if key is not yet in environment
    existing = os.environ.get(env_var)
    if existing:
        return existing

    try:
        entered = getpass.getpass(f"Enter your Iceberg API key (or generate at {embed_url}): ").strip()
        if entered:
            os.environ[env_var] = entered
            return entered
    except Exception:
        pass
    return None
