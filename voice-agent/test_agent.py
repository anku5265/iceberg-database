"""
Voice Agent test — bina phone ke conversation test karo.
Run: python test_agent.py
"""
import httpx

BASE = "http://localhost:8001"

def test_conversation(business: dict, messages: list):
    print(f"\n{'='*50}")
    print(f"Business: {business['business_name']}")
    print(f"{'='*50}")
    
    history = []
    for msg in messages:
        print(f"\nUser: {msg}")
        try:
            r = httpx.post(f"{BASE}/test/chat", json={
                **business,
                "message": msg,
                "history": history
            }, timeout=15)
            data = r.json()
            response = data.get("response", "Error")
            appt = data.get("appointment_detected")
            
            print(f"Agent: {response}")
            if appt:
                print(f"✅ Appointment detected: {appt}")
            
            history.append({"role": "user", "content": msg})
            history.append({"role": "assistant", "content": response})
        except Exception as e:
            print(f"Error: {e}")
        print("-" * 40)

if __name__ == "__main__":
    # Test 1: Hindi clinic
    test_conversation(
        {
            "business_name": "Dr. Sharma Clinic",
            "business_type": "medical clinic",
            "business_info": "Dr. Sharma (General Physician). Mon-Sat 9am-6pm. Fee ₹300. Appointment needed."
        },
        [
            "नमस्ते, मुझे doctor से मिलना है",
            "Rahul Kumar",
            "Kal 11 baje theek rahega",
            "Bas checkup ke liye"
        ]
    )

    # Test 2: English restaurant
    test_conversation(
        {
            "business_name": "Spice Garden",
            "business_type": "restaurant",
            "business_info": "Indian restaurant. Open 12pm-11pm. Table booking available. Special: Biryani. Capacity 50."
        },
        [
            "Hello, I want to book a table for tonight",
            "For 4 people, around 8pm",
            "My name is Priya"
        ]
    )

    # Test 3: Hinglish coaching
    test_conversation(
        {
            "business_name": "Bright Future Coaching",
            "business_type": "coaching center",
            "business_info": "JEE/NEET coaching. Fee ₹15,000/year. New batch monthly. Classes 7-9am and 5-7pm."
        },
        [
            "Hello, fees kitni hai JEE ke liye?",
            "Aur batch kab start hoga?",
            "Okay, mujhe admission lena hai"
        ]
    )
