 OneFace

## Attendance Reimagined

# 👎 The Problem

Manual attendance tracking—especially in college organizations and events—is broken.  
Organizers rely on outdated solutions like Google Forms or pen-and-paper, which are:

- Error-prone  
- Time-consuming  
- Easy to fake or forget  

---

# ✅ The Solution

**OneFace** is a seamless, facial recognition-based attendance system.

- Admins create events or classes through our portal  
- Members enroll once, then check in just by showing up  
- No QR codes. No tapping screens. No forms.  
- Just walk in—**your face is your check-in**  

---

# 🚀 Why Now

- Facial recognition is **accurate**, **fast**, and **affordable**  
- Organizations and schools are actively seeking **automation**  
- Privacy concerns are addressable via **opt-in** and **secure infrastructure**  

---

# 📈 Market Opportunity

- **19M+** college students in the U.S.  
- **300K+** student orgs  
- Expands naturally into:  
  - Corporate training sessions  
  - Fitness classes  
  - Events and conferences  

---

# 🛠️ Tech Stack

- **Frontend**: React  
- **Backend**: Node.js  
- **Cloud Infra**: AWS (Lambda, Rekognition, S3, DynamoDB, API Gateway, VPC, SQS)  
- Built **serverless** for scalability and cost efficiency  

---

# 🔒 Privacy & Security

- Opt-in facial enrollment  
- Secure storage and **compliance-focused infrastructure**  
- Data access is **role-based** and **encrypted**  

---

# 💡 How We Used Lambda

AWS Lambda powers our entire backend logic — **secure, serverless, and event-driven**.

- 🔐 **User Authentication**: Handles signups, logins, and verification with Cognito.  
- 🧠 **Facial Recognition Workflow**: Processes images, calls Rekognition, and matches users in DynamoDB — all in real time.  
- 📝 **Attendance Logging**: Automatically logs attendance or updates status with minimal latency.  
- 📊 **Analytics & Dashboards**: Serves user data, event metrics, and attendance summaries to the frontend via clean API routes.  

By going serverless with Lambda, we eliminated infrastructure overhead and ensured our system scales effortlessly with usage — from a club meeting to a stadium event.

---

# 🌍 Vision

To become the **invisible infrastructure** behind attendance tracking in schools, workplaces, and events worldwide.

