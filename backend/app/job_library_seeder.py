import json
import uuid
import re
from sqlalchemy.orm import Session
from app.database import OccupationsModel, JobLibraryModel

GLOBAL_JOB_SEED_DATA = [
  # 1. Technology & Software Engineering
  {
    "canonical_title": "Software Engineer",
    "alternative_titles": ["Software Developer", "Full Stack Engineer", "Backend Engineer", "Application Developer"],
    "occupation_code": "ISCO-08 2512",
    "industry": "Information Technology",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Designs, develops, tests, and maintains scalable software applications, backend REST APIs, and microservices across web and cloud infrastructure.",
    "responsibilities": [
      "Design and implement scalable RESTful APIs and backend services.",
      "Collaborate with cross-functional teams to define technical requirements.",
      "Write clean, maintainable, and well-tested code with automated test coverage.",
      "Optimize database queries and system performance for high availability."
    ],
    "required_skills": ["Python", "JavaScript", "TypeScript", "React", "SQL", "REST API", "Git"],
    "preferred_skills": ["Docker", "Kubernetes", "AWS", "FastAPI", "GraphQL", "CI/CD"],
    "tools": ["VS Code", "Postman", "Docker", "Git", "Jira"],
    "education": "Bachelor's Degree in Computer Science or related technical field",
    "experience_years": 5.0
  },
  {
    "canonical_title": "Frontend Developer",
    "alternative_titles": ["React Developer", "UI Developer", "Web Application Engineer"],
    "occupation_code": "ISCO-08 2512",
    "industry": "Information Technology",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Specializes in building responsive, high-performance web interfaces, complex single-page applications, and interactive user experiences.",
    "responsibilities": [
      "Build modular, accessible React components using TypeScript and modern CSS.",
      "Integrate backend REST APIs and manage client-side state transitions.",
      "Optimize web application performance, bundle size, and render latency.",
      "Ensure cross-browser compatibility and responsive layout scalability."
    ],
    "required_skills": ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind"],
    "preferred_skills": ["Next.js", "Redux", "Jest", "Cypress", "Figma", "Web Workers"],
    "tools": ["React", "Vite", "Figma", "Chrome DevTools", "npm"],
    "education": "Bachelor's Degree in Computer Science or equivalent experience",
    "experience_years": 3.0
  },
  {
    "canonical_title": "Backend Engineer",
    "alternative_titles": ["Python Engineer", "API Specialist", "Systems Engineer"],
    "occupation_code": "ISCO-08 2512",
    "industry": "Information Technology",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Engineers robust server-side architecture, relational database models, caching strategies, and secure API gateways for distributed systems.",
    "responsibilities": [
      "Develop high-throughput RESTful endpoints using Python, FastAPI, and Node.js.",
      "Design PostgreSQL database schemas, indexes, and complex SQL queries.",
      "Implement authentication, authorization, and rate limiting security protocols.",
      "Monitor system health, error rates, and memory usage in cloud environments."
    ],
    "required_skills": ["Python", "FastAPI", "Django", "SQL", "PostgreSQL", "REST API", "System Design"],
    "preferred_skills": ["Redis", "Docker", "AWS", "Kafka", "Elasticsearch", "gRPC"],
    "tools": ["PostgreSQL", "Docker", "FastAPI", "Swagger", "Git"],
    "education": "Bachelor's Degree in Computer Science or Software Engineering",
    "experience_years": 5.0
  },

  # 2. Data & Artificial Intelligence
  {
    "canonical_title": "Data Analyst",
    "alternative_titles": ["Business Data Analyst", "BI Analyst", "Reporting Specialist"],
    "occupation_code": "ISCO-08 2511",
    "industry": "Data & Analytics",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Translates complex datasets into actionable business intelligence, interactive dashboards, and executive reporting metrics.",
    "responsibilities": [
      "Extract, clean, and analyze structured data using SQL queries and Python.",
      "Design interactive dashboards in Power BI and Tableau for executive decision making.",
      "Perform statistical analysis and hypothesis testing on business metrics.",
      "Collaborate with stakeholders to identify key performance indicators (KPIs)."
    ],
    "required_skills": ["SQL", "Python", "Excel", "Data Visualization", "Power BI", "Tableau"],
    "preferred_skills": ["Snowflake", "BigQuery", "dbt", "ETL", "R", "Statistical Analysis"],
    "tools": ["SQL Server", "Power BI", "Tableau", "Jupyter", "Excel"],
    "education": "Bachelor's Degree in Statistics, Data Science, Economics, or Business",
    "experience_years": 3.0
  },
  {
    "canonical_title": "Data Scientist",
    "alternative_titles": ["Machine Learning Scientist", "Predictive Analytics Specialist"],
    "occupation_code": "ISCO-08 2512",
    "industry": "Data & Analytics",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Builds predictive machine learning models, statistical algorithms, and data pipelines to solve complex business problems.",
    "responsibilities": [
      "Develop and evaluate predictive ML models using PyTorch, Scikit-learn, and XGBoost.",
      "Preprocess large-scale structured and unstructured data using Pandas and Spark.",
      "Conduct feature engineering, hyperparameter tuning, and cross-validation.",
      "Deploy machine learning inference endpoints into production environments."
    ],
    "required_skills": ["Python", "Machine Learning", "PyTorch", "Scikit-learn", "SQL", "Pandas"],
    "preferred_skills": ["NLP", "Deep Learning", "TensorFlow", "Spark", "MLOps", "Docker"],
    "tools": ["PyTorch", "Jupyter", "Git", "Docker", "MLflow"],
    "education": "Master's or Bachelor's Degree in Data Science, Computer Science, or Mathematics",
    "experience_years": 4.0
  },
  {
    "canonical_title": "Machine Learning Engineer",
    "alternative_titles": ["AI Engineer", "MLOps Engineer", "NLP Developer"],
    "occupation_code": "ISCO-08 2512",
    "industry": "Artificial Intelligence",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Architects, trains, fine-tunes, and deploys production machine learning, NLP, and Large Language Model (LLM) pipelines at scale.",
    "responsibilities": [
      "Implement and fine-tune transformer models, LLMs, and neural network architectures.",
      "Build automated MLOps pipelines for continuous training, evaluation, and deployment.",
      "Optimize inference latency and GPU memory utilization for production services.",
      "Ensure model explainability, robustness auditing, and ethical AI safeguards."
    ],
    "required_skills": ["Python", "Machine Learning", "PyTorch", "TensorFlow", "NLP", "LLM", "Docker"],
    "preferred_skills": ["FastAPI", "Kubernetes", "CUDA", "LangChain", "Prompt Engineering", "MLOps"],
    "tools": ["PyTorch", "HuggingFace", "Docker", "FastAPI", "W&B"],
    "education": "Master's Degree in Computer Science, Artificial Intelligence, or Data Science",
    "experience_years": 5.0
  },

  # 3. Cybersecurity & Cloud Infrastructure
  {
    "canonical_title": "Cybersecurity Specialist",
    "alternative_titles": ["Security Engineer", "Information Security Analyst", "SOC Specialist"],
    "occupation_code": "ISCO-08 2519",
    "industry": "Cybersecurity",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Protects organizational networks, systems, and cloud assets against security threats, vulnerabilities, and unauthorized intrusion.",
    "responsibilities": [
      "Conduct security audits, vulnerability assessments, and penetration testing.",
      "Monitor SIEM logs for suspicious security incidents and execute response playbooks.",
      "Implement network firewalls, IAM policies, and data encryption standards.",
      "Ensure compliance with ISO 27001, SOC 2, and regulatory security frameworks."
    ],
    "required_skills": ["Cybersecurity", "Network Security", "Penetration Testing", "SIEM", "Incident Response"],
    "preferred_skills": ["CISSP", "CompTIA Security+", "Wireshark", "Cloud Security", "Cryptography"],
    "tools": ["Wireshark", "Splunk", "Nmap", "Metasploit", "AWS IAM"],
    "education": "Bachelor's Degree in Cybersecurity, Information Technology, or Computer Science",
    "experience_years": 5.0
  },
  {
    "canonical_title": "DevOps & Cloud Engineer",
    "alternative_titles": ["Cloud Infrastructure Engineer", "Site Reliability Engineer", "Platform Engineer"],
    "occupation_code": "ISCO-08 2512",
    "industry": "Cloud & Infrastructure",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Automates cloud infrastructure provisioning, CI/CD deployment pipelines, and Kubernetes cluster orchestration for reliability.",
    "responsibilities": [
      "Provision infrastructure-as-code using Terraform and Ansible on AWS/Azure.",
      "Maintain Kubernetes container clusters and Docker deployment workloads.",
      "Build automated CI/CD release pipelines with GitHub Actions and Jenkins.",
      "Configure system monitoring, logging, and alerting using Prometheus and Grafana."
    ],
    "required_skills": ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux", "Bash"],
    "preferred_skills": ["Ansible", "Jenkins", "Prometheus", "Grafana", "Python", "GCP"],
    "tools": ["AWS Console", "Kubernetes", "Docker", "Terraform", "GitHub Actions"],
    "education": "Bachelor's Degree in Computer Science, Systems Engineering, or IT",
    "experience_years": 4.0
  },

  # 4. Product, Design & Business
  {
    "canonical_title": "Product Manager",
    "alternative_titles": ["Technical Product Manager", "Digital Product Lead", "Group Product Manager"],
    "occupation_code": "ISCO-08 1219",
    "industry": "Product Management",
    "seniority": "Lead",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Drives product strategy, customer research, roadmap prioritization, and feature delivery across engineering and design teams.",
    "responsibilities": [
      "Define product vision, quarterly roadmaps, and OKRs based on customer insights.",
      "Write detailed user stories, acceptance criteria, and product spec documents.",
      "Analyze product usage metrics and conduct A/B testing to optimize conversion.",
      "Lead Agile sprint planning, grooming, and cross-functional feature releases."
    ],
    "required_skills": ["Product Roadmap", "Agile", "Scrum", "User Stories", "Jira", "A/B Testing"],
    "preferred_skills": ["SQL", "Figma", "Mixpanel", "Product Lifecycle", "Market Research"],
    "tools": ["Jira", "Figma", "Mixpanel", "Confluence", "Notion"],
    "education": "Bachelor's Degree in Business, Computer Science, or Engineering",
    "experience_years": 5.0
  },
  {
    "canonical_title": "UI/UX Designer",
    "alternative_titles": ["Product Designer", "User Experience Designer", "Interaction Designer"],
    "occupation_code": "ISCO-08 2166",
    "industry": "Design & User Experience",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Crafts intuitive user journeys, interactive wireframes, design systems, and high-fidelity product prototypes for web and mobile.",
    "responsibilities": [
      "Conduct user research, usability testing, and customer journey mapping.",
      "Design wireframes, interactive prototypes, and UI component design systems in Figma.",
      "Collaborate with frontend developers to ensure design pixel perfection.",
      "Iterate on product interfaces based on user feedback and usability metrics."
    ],
    "required_skills": ["Figma", "UI Design", "UX Research", "Wireframing", "Prototyping", "Design Systems"],
    "preferred_skills": ["Sketch", "Adobe XD", "Usability Testing", "HTML/CSS", "Design Thinking"],
    "tools": ["Figma", "Sketch", "Adobe Creative Suite", "Miro", "Zeplin"],
    "education": "Bachelor's Degree in Design, Human-Computer Interaction, or Fine Arts",
    "experience_years": 3.0
  },

  # 5. Finance, Business & Human Resources
  {
    "canonical_title": "Financial Analyst",
    "alternative_titles": ["Corporate Finance Analyst", "Investment Analyst", "Financial Modeling Specialist"],
    "occupation_code": "ISCO-08 2413",
    "industry": "Finance & Accounting",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Conducts financial forecasting, valuation modeling, variance analysis, and strategic budgeting for corporate decision-making.",
    "responsibilities": [
      "Build complex financial models, DCF valuations, and multi-scenario forecasts in Excel.",
      "Analyze monthly budget variance, operating expenses, and revenue growth drivers.",
      "Prepare quarterly financial reports and presentation decks for executive leadership.",
      "Evaluate investment opportunities, capital expenditure, and ROI metrics."
    ],
    "required_skills": ["Financial Modeling", "Valuation", "Forecasting", "Budgeting", "Excel", "Financial Analysis"],
    "preferred_skills": ["GAAP", "IFRS", "SAP", "QuickBooks", "SQL", "Corporate Finance"],
    "tools": ["Excel", "SAP", "QuickBooks", "Bloomberg Terminal", "PowerPoint"],
    "education": "Bachelor's Degree in Finance, Accounting, Economics, or Business Administration",
    "experience_years": 3.0
  },
  {
    "canonical_title": "Human Resources Manager",
    "alternative_titles": ["HR Director", "People Operations Manager", "Talent Acquisition Lead"],
    "occupation_code": "ISCO-08 1212",
    "industry": "Human Resources",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Oversees organizational talent acquisition, employee relations, performance management, workforce planning, and HR compliance.",
    "responsibilities": [
      "Develop and execute talent acquisition, recruitment, and onboarding strategies.",
      "Manage employee relations, conflict resolution, and performance evaluation cycles.",
      "Ensure organizational compliance with employment laws and labor regulations.",
      "Administer competitive compensation, benefits packages, and employee retention programs."
    ],
    "required_skills": ["Talent Acquisition", "Onboarding", "HRIS", "Employee Relations", "Performance Management"],
    "preferred_skills": ["Workday", "BambooHR", "Workforce Planning", "HR Compliance", "Compensation & Benefits"],
    "tools": ["Workday", "BambooHR", "Greenhouse", "LinkedIn Recruiter", "Excel"],
    "education": "Bachelor's Degree in Human Resources, Business, or Organizational Psychology",
    "experience_years": 5.0
  },

  # 6. Engineering & Healthcare
  {
    "canonical_title": "Civil Engineer",
    "alternative_titles": ["Structural Engineer", "Construction Manager", "Infrastructure Engineer"],
    "occupation_code": "ISCO-08 2142",
    "industry": "Engineering & Construction",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Plans, designs, and manages major civil infrastructure projects, building structures, transportation routes, and site engineering.",
    "responsibilities": [
      "Design structural engineering blueprints and technical calculations using AutoCAD and Revit.",
      "Manage on-site construction operations, safety standards, and project timelines.",
      "Perform soil analysis, environmental impact studies, and structural feasibility reviews.",
      "Ensure compliance with municipal building codes, zoning rules, and safety regulations."
    ],
    "required_skills": ["CAD", "AutoCAD", "Structural Analysis", "Construction Management", "Site Supervision"],
    "preferred_skills": ["Revit", "GIS", "Project Estimation", "Building Codes", "Concrete Design"],
    "tools": ["AutoCAD", "Revit", "Civil 3D", "MS Project", "Excel"],
    "education": "Bachelor's Degree in Civil Engineering or Structural Engineering",
    "experience_years": 5.0
  },
  {
    "canonical_title": "Registered Nurse",
    "alternative_titles": ["Clinical Nurse", "Staff Nurse", "Healthcare Specialist"],
    "occupation_code": "ISCO-08 2221",
    "industry": "Healthcare & Nursing",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / Clinical",
    "description": "Delivers direct patient care, clinical assessments, medication administration, and patient health monitoring in medical facilities.",
    "responsibilities": [
      "Assess patient vital signs, medical history, and clinical symptoms.",
      "Administer prescribed medications, intravenous therapy, and medical treatments.",
      "Maintain accurate electronic medical records (EMR) and patient documentation.",
      "Educate patients and families on post-treatment health management and recovery."
    ],
    "required_skills": ["Patient Care", "Clinical Research", "EMR", "Triage", "Medication Administration"],
    "preferred_skills": ["ICU Care", "Pediatric Care", "BLS Certification", "ACLS Certification", "Patient Education"],
    "tools": ["Epic EMR", "Cerner", "Patient Monitors", "IV Infusion Pumps"],
    "education": "Bachelor of Science in Nursing (BSN) or Registered Nurse (RN) License",
    "experience_years": 3.0
  },

  # 7. Marketing, Sales & Communications
  {
    "canonical_title": "Digital Marketing Manager",
    "alternative_titles": ["Marketing Manager", "Growth Marketing Lead", "Performance Marketing Specialist"],
    "occupation_code": "ISCO-08 1221",
    "industry": "Marketing & Advertising",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Plans, executes, and optimizes multi-channel digital marketing campaigns across paid search, social media, email, and content channels to drive customer acquisition and revenue growth.",
    "responsibilities": [
      "Develop and manage integrated digital marketing strategies across SEM, SEO, social, and email.",
      "Analyze campaign performance metrics, conversion rates, and customer acquisition cost (CAC).",
      "Manage advertising budgets across Google Ads, Meta Ads, LinkedIn, and programmatic platforms.",
      "Collaborate with creative and product teams on brand messaging, landing pages, and A/B tests."
    ],
    "required_skills": ["SEO", "SEM", "Google Ads", "Social Media Marketing", "Content Marketing", "Email Marketing", "Analytics"],
    "preferred_skills": ["HubSpot", "Marketo", "Google Analytics", "Meta Ads", "Copywriting", "Marketing Automation"],
    "tools": ["Google Analytics", "Google Ads", "HubSpot", "Mailchimp", "Canva"],
    "education": "Bachelor's Degree in Marketing, Business, Communications, or related field",
    "experience_years": 5.0
  },
  {
    "canonical_title": "Sales Manager",
    "alternative_titles": ["Account Executive", "Business Development Manager", "Sales Director"],
    "occupation_code": "ISCO-08 1221",
    "industry": "Sales & Business Development",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Leads sales teams, manages pipeline strategy, drives revenue targets, and builds long-term client relationships across B2B and B2C markets.",
    "responsibilities": [
      "Manage end-to-end sales pipeline from prospecting to contract negotiation and closing.",
      "Set quarterly revenue targets, sales quotas, and performance incentive structures.",
      "Coach and develop sales representatives on consultative selling techniques.",
      "Analyze CRM data to forecast revenue and identify upselling and cross-selling opportunities."
    ],
    "required_skills": ["Sales Strategy", "CRM", "Pipeline Management", "Negotiation", "Revenue Forecasting", "B2B Sales"],
    "preferred_skills": ["Salesforce", "HubSpot CRM", "Account Management", "Consultative Selling", "SaaS Sales"],
    "tools": ["Salesforce", "HubSpot", "LinkedIn Sales Navigator", "Zoom", "Excel"],
    "education": "Bachelor's Degree in Business, Marketing, or Communications",
    "experience_years": 5.0
  },
  {
    "canonical_title": "Content Writer",
    "alternative_titles": ["Copywriter", "Content Strategist", "Technical Writer", "Blog Writer"],
    "occupation_code": "ISCO-08 2641",
    "industry": "Media & Communications",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Creates compelling written content including articles, blog posts, website copy, whitepapers, and marketing collateral aligned with brand voice and SEO strategy.",
    "responsibilities": [
      "Research, outline, and write long-form articles, blog posts, and landing page copy.",
      "Optimize content for search engines using keyword research and on-page SEO best practices.",
      "Collaborate with marketing, design, and product teams on content calendars and briefs.",
      "Edit and proofread content for clarity, grammar, tone consistency, and brand alignment."
    ],
    "required_skills": ["Content Writing", "SEO Writing", "Copywriting", "Research", "Editing", "Content Strategy"],
    "preferred_skills": ["WordPress", "Google Analytics", "Social Media", "Email Marketing", "Storytelling"],
    "tools": ["Google Docs", "WordPress", "Grammarly", "Ahrefs", "Canva"],
    "education": "Bachelor's Degree in English, Journalism, Communications, or Marketing",
    "experience_years": 3.0
  },

  # 8. Legal & Compliance
  {
    "canonical_title": "Corporate Lawyer",
    "alternative_titles": ["Legal Counsel", "Attorney", "In-House Counsel", "Legal Advisor"],
    "occupation_code": "ISCO-08 2611",
    "industry": "Legal & Compliance",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Advises organizations on corporate governance, contract law, intellectual property, regulatory compliance, and M&A transactions.",
    "responsibilities": [
      "Draft, review, and negotiate commercial contracts, NDAs, and partnership agreements.",
      "Provide legal counsel on corporate governance, employment law, and regulatory compliance.",
      "Manage intellectual property portfolio including patents, trademarks, and copyrights.",
      "Support due diligence and legal documentation for mergers, acquisitions, and fundraising."
    ],
    "required_skills": ["Corporate Law", "Contract Law", "Compliance", "Intellectual Property", "Legal Research", "Negotiation"],
    "preferred_skills": ["M&A", "Securities Law", "GDPR", "Employment Law", "Litigation", "Risk Assessment"],
    "tools": ["Westlaw", "LexisNexis", "DocuSign", "Microsoft Office", "Contract Management Systems"],
    "education": "Juris Doctor (JD) or LLB with Bar Admission",
    "experience_years": 5.0
  },

  # 9. Accounting & Auditing
  {
    "canonical_title": "Accountant",
    "alternative_titles": ["Certified Public Accountant", "Tax Accountant", "Financial Controller", "Audit Associate"],
    "occupation_code": "ISCO-08 2411",
    "industry": "Finance & Accounting",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Manages financial records, prepares tax filings, conducts audits, and ensures organizational compliance with accounting standards and regulatory requirements.",
    "responsibilities": [
      "Prepare and maintain accurate financial statements, balance sheets, and income statements.",
      "Conduct month-end and year-end closing procedures and journal entries.",
      "Ensure compliance with GAAP, IFRS, and local tax regulations.",
      "Perform internal audits and support external audit engagements."
    ],
    "required_skills": ["Accounting", "Financial Reporting", "Tax Preparation", "GAAP", "Auditing", "Excel"],
    "preferred_skills": ["IFRS", "CPA Certification", "SAP", "QuickBooks", "ERP Systems", "Budgeting"],
    "tools": ["QuickBooks", "SAP", "Excel", "Xero", "Oracle Financials"],
    "education": "Bachelor's Degree in Accounting, Finance, or Business Administration",
    "experience_years": 3.0
  },

  # 10. Engineering (Mechanical, Electrical, Aerospace)
  {
    "canonical_title": "Mechanical Engineer",
    "alternative_titles": ["Design Engineer", "Manufacturing Engineer", "CAD Engineer"],
    "occupation_code": "ISCO-08 2144",
    "industry": "Engineering & Manufacturing",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Designs, analyzes, and tests mechanical systems, components, and manufacturing processes using CAD/CAM tools and engineering simulation.",
    "responsibilities": [
      "Design mechanical components and assemblies using SolidWorks, CATIA, or AutoCAD.",
      "Perform stress analysis, thermal analysis, and FEA simulation on mechanical parts.",
      "Develop manufacturing process documentation, BOMs, and engineering change orders.",
      "Collaborate with cross-functional teams on product development and prototype testing."
    ],
    "required_skills": ["Mechanical Design", "SolidWorks", "AutoCAD", "FEA", "Manufacturing", "GD&T"],
    "preferred_skills": ["CATIA", "ANSYS", "CNC Machining", "3D Printing", "Six Sigma", "Lean Manufacturing"],
    "tools": ["SolidWorks", "AutoCAD", "ANSYS", "MATLAB", "MS Project"],
    "education": "Bachelor's Degree in Mechanical Engineering or related field",
    "experience_years": 3.0
  },
  {
    "canonical_title": "Electrical Engineer",
    "alternative_titles": ["Electronics Engineer", "Power Systems Engineer", "Embedded Systems Engineer"],
    "occupation_code": "ISCO-08 2151",
    "industry": "Engineering & Manufacturing",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Designs, develops, and tests electrical circuits, power systems, embedded firmware, and control systems for industrial and consumer applications.",
    "responsibilities": [
      "Design printed circuit boards (PCBs), schematics, and electrical wiring diagrams.",
      "Program embedded systems using C/C++ for microcontrollers and FPGA devices.",
      "Test and debug electrical prototypes using oscilloscopes, multimeters, and logic analyzers.",
      "Ensure compliance with electrical safety standards (IEC, UL, CE)."
    ],
    "required_skills": ["Circuit Design", "PCB Design", "Embedded Systems", "C/C++", "Power Systems", "Control Systems"],
    "preferred_skills": ["VHDL", "MATLAB", "PLC Programming", "FPGA", "Signal Processing", "Altium"],
    "tools": ["Altium Designer", "MATLAB", "Simulink", "Oscilloscope", "Eagle"],
    "education": "Bachelor's Degree in Electrical or Electronics Engineering",
    "experience_years": 3.0
  },

  # 11. Architecture & Construction
  {
    "canonical_title": "Architect",
    "alternative_titles": ["Building Architect", "Interior Architect", "Urban Planner"],
    "occupation_code": "ISCO-08 2161",
    "industry": "Architecture & Design",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Designs building structures, spatial layouts, and urban environments using sustainable design principles and 3D modeling tools.",
    "responsibilities": [
      "Create architectural drawings, 3D renderings, and construction documentation using Revit and SketchUp.",
      "Develop conceptual designs, feasibility studies, and client design presentations.",
      "Ensure compliance with building codes, zoning regulations, and environmental standards.",
      "Coordinate with structural engineers, contractors, and MEP consultants during construction."
    ],
    "required_skills": ["Architectural Design", "Revit", "AutoCAD", "3D Modeling", "Building Codes", "Sustainability"],
    "preferred_skills": ["SketchUp", "Rhino", "Grasshopper", "LEED", "BIM", "Rendering"],
    "tools": ["Revit", "AutoCAD", "SketchUp", "Rhino", "Adobe Creative Suite"],
    "education": "Bachelor's or Master's Degree in Architecture",
    "experience_years": 5.0
  },

  # 12. Education & Research
  {
    "canonical_title": "University Professor",
    "alternative_titles": ["Lecturer", "Academic Researcher", "Teaching Faculty"],
    "occupation_code": "ISCO-08 2310",
    "industry": "Education & Research",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Teaches undergraduate and graduate courses, conducts original academic research, publishes peer-reviewed papers, and supervises graduate students.",
    "responsibilities": [
      "Develop course curricula, syllabi, lectures, and assessment materials.",
      "Conduct original research, publish peer-reviewed papers, and present at conferences.",
      "Supervise graduate student theses, dissertations, and research projects.",
      "Apply for and manage research grants and institutional funding."
    ],
    "required_skills": ["Teaching", "Research", "Academic Writing", "Curriculum Development", "Grant Writing", "Mentoring"],
    "preferred_skills": ["Peer Review", "Data Analysis", "Public Speaking", "Lab Management", "Student Advising"],
    "tools": ["LMS", "LaTeX", "SPSS", "Google Scholar", "Zoom"],
    "education": "Ph.D. or Doctorate in relevant academic discipline",
    "experience_years": 5.0
  },

  # 13. Pharmacy & Healthcare
  {
    "canonical_title": "Pharmacist",
    "alternative_titles": ["Clinical Pharmacist", "Hospital Pharmacist", "Retail Pharmacist"],
    "occupation_code": "ISCO-08 2262",
    "industry": "Healthcare & Pharmacy",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / Clinical",
    "description": "Dispenses medications, provides pharmaceutical care consultations, reviews drug interactions, and ensures patient medication safety and compliance.",
    "responsibilities": [
      "Review and dispense prescription medications according to physician orders.",
      "Counsel patients on medication usage, side effects, and drug interactions.",
      "Manage pharmacy inventory, controlled substances, and medication storage.",
      "Collaborate with healthcare providers on optimal pharmacotherapy plans."
    ],
    "required_skills": ["Pharmaceutical Care", "Medication Management", "Drug Interaction Review", "Patient Counseling", "Prescription Processing"],
    "preferred_skills": ["Clinical Pharmacy", "Compounding", "Pharmacovigilance", "Immunization", "EHR Systems"],
    "tools": ["Pharmacy Dispensing Systems", "EHR", "Drug Interaction Databases", "Inventory Management"],
    "education": "Doctor of Pharmacy (PharmD) or Bachelor of Pharmacy",
    "experience_years": 3.0
  },

  # 14. Supply Chain & Logistics
  {
    "canonical_title": "Supply Chain Manager",
    "alternative_titles": ["Logistics Manager", "Procurement Manager", "Operations Logistics Lead"],
    "occupation_code": "ISCO-08 1324",
    "industry": "Supply Chain & Logistics",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Oversees end-to-end supply chain operations including procurement, inventory management, warehousing, distribution, and vendor relationship management.",
    "responsibilities": [
      "Manage procurement cycles, supplier negotiations, and vendor performance evaluations.",
      "Optimize inventory levels, demand forecasting, and warehouse logistics operations.",
      "Coordinate international shipping, customs clearance, and freight management.",
      "Implement supply chain analytics and ERP systems for operational visibility."
    ],
    "required_skills": ["Supply Chain Management", "Procurement", "Inventory Management", "Logistics", "Vendor Management", "Demand Forecasting"],
    "preferred_skills": ["SAP SCM", "Oracle", "Lean Six Sigma", "International Trade", "Customs Compliance"],
    "tools": ["SAP", "Oracle SCM", "Excel", "Tableau", "ERP Systems"],
    "education": "Bachelor's Degree in Supply Chain Management, Business, or Industrial Engineering",
    "experience_years": 5.0
  },

  # 15. Project Management & Consulting
  {
    "canonical_title": "Project Manager",
    "alternative_titles": ["Program Manager", "Scrum Master", "Delivery Manager", "Technical Project Manager"],
    "occupation_code": "ISCO-08 1219",
    "industry": "Project Management",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Leads cross-functional project teams through complete project lifecycles using Agile, Scrum, or Waterfall methodologies to deliver on scope, timeline, and budget.",
    "responsibilities": [
      "Define project scope, milestones, deliverables, and resource allocation plans.",
      "Facilitate Agile ceremonies including sprint planning, daily standups, and retrospectives.",
      "Manage project risks, dependencies, and stakeholder communication cadences.",
      "Track project health metrics, budget burn rate, and timeline adherence."
    ],
    "required_skills": ["Project Management", "Agile", "Scrum", "Risk Management", "Stakeholder Management", "Budgeting"],
    "preferred_skills": ["PMP Certification", "PRINCE2", "Jira", "Confluence", "MS Project", "Change Management"],
    "tools": ["Jira", "Confluence", "MS Project", "Asana", "Slack"],
    "education": "Bachelor's Degree in Business, Engineering, or Information Technology",
    "experience_years": 5.0
  },
  {
    "canonical_title": "Management Consultant",
    "alternative_titles": ["Strategy Consultant", "Business Consultant", "Operations Consultant"],
    "occupation_code": "ISCO-08 2421",
    "industry": "Consulting & Advisory",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Advises organizations on strategy, operations, organizational design, digital transformation, and performance improvement initiatives.",
    "responsibilities": [
      "Conduct industry research, competitive analysis, and market sizing exercises.",
      "Develop strategic recommendations and executive-level presentation decks.",
      "Lead client workshops, stakeholder interviews, and change management programs.",
      "Build financial models, business cases, and ROI analyses for transformation initiatives."
    ],
    "required_skills": ["Strategy", "Business Analysis", "Financial Modeling", "Stakeholder Management", "Problem Solving", "Presentation"],
    "preferred_skills": ["McKinsey Problem Solving", "Lean Six Sigma", "Change Management", "Digital Transformation"],
    "tools": ["PowerPoint", "Excel", "Tableau", "Miro", "Notion"],
    "education": "Bachelor's Degree in Business, Economics, or Engineering; MBA preferred",
    "experience_years": 4.0
  },

  # 16. Business Analysis & QA
  {
    "canonical_title": "Business Analyst",
    "alternative_titles": ["Systems Analyst", "Requirements Analyst", "Process Analyst"],
    "occupation_code": "ISCO-08 2511",
    "industry": "Business Analysis",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Bridges business stakeholders and technical teams by gathering requirements, mapping business processes, and translating needs into actionable product specifications.",
    "responsibilities": [
      "Elicit, document, and validate business requirements through stakeholder interviews.",
      "Create business process models, data flow diagrams, and use case specifications.",
      "Perform gap analysis between current state and desired future state workflows.",
      "Support UAT coordination and product acceptance testing with business users."
    ],
    "required_skills": ["Requirements Gathering", "Business Process Modeling", "SQL", "Documentation", "Stakeholder Communication", "Data Analysis"],
    "preferred_skills": ["BPMN", "Visio", "Jira", "Agile", "Power BI", "User Stories"],
    "tools": ["Jira", "Confluence", "Visio", "Excel", "SQL"],
    "education": "Bachelor's Degree in Business, Information Systems, or Computer Science",
    "experience_years": 3.0
  },
  {
    "canonical_title": "QA Engineer",
    "alternative_titles": ["Quality Assurance Engineer", "Test Automation Engineer", "SDET"],
    "occupation_code": "ISCO-08 2512",
    "industry": "Information Technology",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Designs and executes manual and automated software testing strategies to ensure product quality, reliability, and regression-free releases.",
    "responsibilities": [
      "Develop comprehensive test plans, test cases, and regression test suites.",
      "Write automated test scripts using Selenium, Cypress, Playwright, or Jest.",
      "Perform API testing, integration testing, and performance load testing.",
      "Report and track defects in bug tracking systems and validate fixes."
    ],
    "required_skills": ["Test Automation", "Selenium", "API Testing", "Test Planning", "Bug Tracking", "SQL"],
    "preferred_skills": ["Cypress", "Playwright", "Jest", "Performance Testing", "CI/CD", "Postman"],
    "tools": ["Selenium", "Cypress", "Jira", "Postman", "Jenkins"],
    "education": "Bachelor's Degree in Computer Science, Software Engineering, or IT",
    "experience_years": 3.0
  },

  # 17. Database, Network, & IT Infrastructure
  {
    "canonical_title": "Database Administrator",
    "alternative_titles": ["DBA", "Database Engineer", "Data Platform Engineer"],
    "occupation_code": "ISCO-08 2521",
    "industry": "Information Technology",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Manages, optimizes, and secures organizational database systems including backup strategies, replication, performance tuning, and disaster recovery.",
    "responsibilities": [
      "Administer PostgreSQL, MySQL, Oracle, or SQL Server database instances.",
      "Optimize query performance, indexing strategies, and database schema design.",
      "Implement backup, recovery, and high-availability replication configurations.",
      "Monitor database health, storage capacity, and security access controls."
    ],
    "required_skills": ["SQL", "PostgreSQL", "Database Administration", "Performance Tuning", "Backup & Recovery", "Schema Design"],
    "preferred_skills": ["Oracle", "MySQL", "MongoDB", "Redis", "Data Warehousing", "ETL"],
    "tools": ["PostgreSQL", "pgAdmin", "Oracle Enterprise Manager", "DataGrip", "Grafana"],
    "education": "Bachelor's Degree in Computer Science, IT, or Database Management",
    "experience_years": 5.0
  },
  {
    "canonical_title": "Network Engineer",
    "alternative_titles": ["Network Administrator", "Systems Network Engineer", "Infrastructure Engineer"],
    "occupation_code": "ISCO-08 2523",
    "industry": "Information Technology",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Designs, configures, and maintains enterprise network infrastructure including routers, switches, firewalls, VPNs, and wireless access points.",
    "responsibilities": [
      "Configure and manage Cisco, Juniper, or Palo Alto network devices.",
      "Design network topology, VLANs, subnetting, and routing protocol implementations.",
      "Monitor network performance, troubleshoot connectivity issues, and optimize throughput.",
      "Implement network security policies, firewall rules, and VPN configurations."
    ],
    "required_skills": ["Networking", "TCP/IP", "Routing & Switching", "Firewalls", "VPN", "Network Security"],
    "preferred_skills": ["CCNA", "CCNP", "Cisco", "Juniper", "SD-WAN", "Wi-Fi 6"],
    "tools": ["Cisco IOS", "Wireshark", "SolarWinds", "Palo Alto", "Nagios"],
    "education": "Bachelor's Degree in Computer Science, Networking, or Information Technology",
    "experience_years": 3.0
  },

  # 18. Data Engineering & Analytics
  {
    "canonical_title": "Data Engineer",
    "alternative_titles": ["ETL Developer", "Data Pipeline Engineer", "Analytics Engineer"],
    "occupation_code": "ISCO-08 2512",
    "industry": "Data & Analytics",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Builds and maintains scalable data pipelines, ETL workflows, data warehouses, and real-time streaming architectures for analytics platforms.",
    "responsibilities": [
      "Design and build ETL/ELT data pipelines using Apache Spark, Airflow, and dbt.",
      "Architect data warehouse schemas in Snowflake, BigQuery, or Redshift.",
      "Implement real-time data streaming using Kafka, Kinesis, or Pub/Sub.",
      "Ensure data quality, lineage tracking, and governance across data assets."
    ],
    "required_skills": ["Python", "SQL", "Apache Spark", "ETL", "Data Warehousing", "Airflow"],
    "preferred_skills": ["Snowflake", "BigQuery", "dbt", "Kafka", "Docker", "Data Governance"],
    "tools": ["Airflow", "Snowflake", "Spark", "dbt", "Docker"],
    "education": "Bachelor's Degree in Computer Science, Data Engineering, or Information Systems",
    "experience_years": 4.0
  },

  # 19. Design & Creative Industries
  {
    "canonical_title": "Graphic Designer",
    "alternative_titles": ["Visual Designer", "Brand Designer", "Creative Designer"],
    "occupation_code": "ISCO-08 2166",
    "industry": "Design & Creative",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Creates visual identities, marketing collateral, social media graphics, print designs, and brand materials using industry-standard design tools.",
    "responsibilities": [
      "Design brand assets, marketing collateral, social media graphics, and print layouts.",
      "Develop and maintain visual brand identity guidelines and design system standards.",
      "Collaborate with marketing, product, and content teams on creative campaigns.",
      "Prepare print-ready files and digital assets across various formats and resolutions."
    ],
    "required_skills": ["Graphic Design", "Adobe Photoshop", "Adobe Illustrator", "Typography", "Brand Design", "Layout Design"],
    "preferred_skills": ["InDesign", "After Effects", "Canva", "Figma", "Motion Graphics", "Print Production"],
    "tools": ["Adobe Photoshop", "Adobe Illustrator", "InDesign", "Canva", "Figma"],
    "education": "Bachelor's Degree in Graphic Design, Visual Arts, or Fine Arts",
    "experience_years": 3.0
  },

  # 20. Operations & Administration
  {
    "canonical_title": "Operations Manager",
    "alternative_titles": ["Operations Director", "General Manager", "Business Operations Lead"],
    "occupation_code": "ISCO-08 1219",
    "industry": "Operations & Administration",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Manages day-to-day business operations, process optimization, team coordination, and cross-departmental efficiency improvement initiatives.",
    "responsibilities": [
      "Oversee daily business operations across multiple departments and functions.",
      "Develop and implement standard operating procedures (SOPs) and process improvements.",
      "Manage operational budgets, resource allocation, and vendor contracts.",
      "Analyze operational KPIs and implement continuous improvement initiatives."
    ],
    "required_skills": ["Operations Management", "Process Improvement", "Budgeting", "Team Leadership", "KPI Analysis", "Vendor Management"],
    "preferred_skills": ["Lean Six Sigma", "ERP Systems", "Change Management", "Project Management", "Strategic Planning"],
    "tools": ["Excel", "SAP", "MS Project", "Tableau", "Slack"],
    "education": "Bachelor's Degree in Business Administration, Operations Management, or related field",
    "experience_years": 5.0
  },

  # 21. Real Estate, Hospitality & Customer Service
  {
    "canonical_title": "Real Estate Agent",
    "alternative_titles": ["Realtor", "Property Consultant", "Real Estate Broker"],
    "occupation_code": "ISCO-08 3334",
    "industry": "Real Estate",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Assists buyers and sellers in real estate transactions, conducts property valuations, negotiates deals, and manages client relationships.",
    "responsibilities": [
      "List, market, and show residential and commercial properties to prospective buyers.",
      "Conduct comparative market analysis (CMA) and property valuation assessments.",
      "Negotiate purchase agreements, counteroffers, and closing terms between parties.",
      "Manage client relationships, property documentation, and regulatory compliance."
    ],
    "required_skills": ["Sales", "Negotiation", "Property Valuation", "Market Analysis", "Client Relations", "Real Estate Law"],
    "preferred_skills": ["MLS Systems", "CRM", "Commercial Real Estate", "Property Management", "Mortgage Knowledge"],
    "tools": ["MLS", "Zillow", "CRM Software", "DocuSign", "Excel"],
    "education": "Real Estate License; Bachelor's Degree in Business or Real Estate preferred",
    "experience_years": 3.0
  },
  {
    "canonical_title": "Customer Success Manager",
    "alternative_titles": ["Client Success Manager", "Account Manager", "Customer Experience Lead"],
    "occupation_code": "ISCO-08 2431",
    "industry": "Customer Service & SaaS",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / Remote",
    "description": "Manages post-sales customer relationships, drives product adoption, reduces churn, and identifies expansion and upselling opportunities.",
    "responsibilities": [
      "Onboard new customers, conduct product training sessions, and ensure activation milestones.",
      "Monitor customer health scores, usage metrics, and satisfaction (NPS/CSAT) surveys.",
      "Identify and mitigate churn risks through proactive engagement and success planning.",
      "Collaborate with sales and product teams on upselling and cross-selling opportunities."
    ],
    "required_skills": ["Customer Success", "Account Management", "Onboarding", "Retention", "Communication", "SaaS"],
    "preferred_skills": ["Gainsight", "Salesforce", "Product Analytics", "Upselling", "Stakeholder Management"],
    "tools": ["Gainsight", "Salesforce", "Intercom", "Zoom", "Excel"],
    "education": "Bachelor's Degree in Business, Communications, or related field",
    "experience_years": 3.0
  },

  # 22. Science & Environment
  {
    "canonical_title": "Environmental Scientist",
    "alternative_titles": ["Environmental Consultant", "Sustainability Analyst", "Ecologist"],
    "occupation_code": "ISCO-08 2133",
    "industry": "Environmental Services",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Conducts environmental impact assessments, monitors pollution levels, develops sustainability programs, and ensures regulatory compliance.",
    "responsibilities": [
      "Conduct environmental site assessments, soil sampling, and water quality testing.",
      "Prepare environmental impact reports and sustainability audit documentation.",
      "Ensure compliance with environmental regulations (EPA, ISO 14001) and permitting.",
      "Develop corporate sustainability programs and carbon footprint reduction strategies."
    ],
    "required_skills": ["Environmental Assessment", "Sustainability", "Data Analysis", "Regulatory Compliance", "GIS", "Report Writing"],
    "preferred_skills": ["ISO 14001", "Carbon Accounting", "Ecology", "Water Resources", "Environmental Law"],
    "tools": ["GIS", "ArcGIS", "Excel", "SPSS", "AutoCAD"],
    "education": "Bachelor's or Master's Degree in Environmental Science, Ecology, or Earth Sciences",
    "experience_years": 3.0
  },

  # 23. Medicine & Healthcare
  {
    "canonical_title": "Physician",
    "alternative_titles": ["Medical Doctor", "General Practitioner", "Attending Physician"],
    "occupation_code": "ISCO-08 2211",
    "industry": "Healthcare & Medicine",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / Clinical",
    "description": "Diagnoses and treats patient medical conditions, prescribes medications, orders diagnostic tests, and provides preventive healthcare counseling.",
    "responsibilities": [
      "Examine patients, diagnose medical conditions, and develop treatment plans.",
      "Prescribe medications, therapies, and specialist referrals as medically indicated.",
      "Interpret diagnostic test results including lab work, imaging, and biopsies.",
      "Maintain accurate patient medical records and clinical documentation."
    ],
    "required_skills": ["Clinical Diagnosis", "Patient Care", "Medical Prescribing", "Clinical Research", "EMR"],
    "preferred_skills": ["Telemedicine", "Evidence-Based Medicine", "Surgical Skills", "Public Health", "Medical Education"],
    "tools": ["EMR Systems", "Medical Devices", "Stethoscope", "Clinical Decision Support"],
    "education": "Doctor of Medicine (MD) or MBBS with Medical License",
    "experience_years": 5.0
  },

  # 24. Hospitality & Tourism
  {
    "canonical_title": "Hotel General Manager",
    "alternative_titles": ["Hospitality Manager", "Resort Manager", "Lodge Manager"],
    "occupation_code": "ISCO-08 1411",
    "industry": "Hospitality & Tourism",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Oversees all hotel operations, guest experience management, revenue optimization, staff management, and facility maintenance.",
    "responsibilities": [
      "Manage daily hotel operations, guest services, and staff scheduling.",
      "Oversee revenue management, room rate optimization, and occupancy forecasting.",
      "Ensure guest satisfaction standards and respond to service escalations.",
      "Manage departmental budgets, vendor contracts, and facility maintenance."
    ],
    "required_skills": ["Hospitality Management", "Guest Relations", "Revenue Management", "Staff Management", "Budgeting"],
    "preferred_skills": ["Opera PMS", "Food & Beverage", "Event Management", "Tourism Marketing", "Multilingual"],
    "tools": ["Opera PMS", "Excel", "Booking Platforms", "POS Systems"],
    "education": "Bachelor's Degree in Hospitality Management, Tourism, or Business",
    "experience_years": 5.0
  },

  # 25. Journalism & Media
  {
    "canonical_title": "Journalist",
    "alternative_titles": ["Reporter", "News Correspondent", "Editor", "Investigative Journalist"],
    "occupation_code": "ISCO-08 2642",
    "industry": "Media & Journalism",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Researches, investigates, and reports news stories across print, digital, broadcast, and multimedia journalism platforms.",
    "responsibilities": [
      "Research, investigate, and write news stories, features, and investigative reports.",
      "Conduct interviews with sources, officials, and subject matter experts.",
      "Meet editorial deadlines and fact-check all published content for accuracy.",
      "Produce multimedia content including video, podcasts, and social media storytelling."
    ],
    "required_skills": ["Journalism", "News Writing", "Reporting", "Research", "Interviewing", "Fact-Checking"],
    "preferred_skills": ["Investigative Journalism", "Data Journalism", "Social Media", "Video Production", "Podcasting"],
    "tools": ["AP Stylebook", "WordPress", "Adobe Premiere", "Social Media Platforms", "CMS"],
    "education": "Bachelor's Degree in Journalism, Communications, or Media Studies",
    "experience_years": 3.0
  },

  # 26. Social Work & Nonprofit
  {
    "canonical_title": "Social Worker",
    "alternative_titles": ["Clinical Social Worker", "Community Social Worker", "Case Manager"],
    "occupation_code": "ISCO-08 2635",
    "industry": "Social Services & Nonprofit",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Provides counseling, case management, crisis intervention, and advocacy services to individuals, families, and communities in need.",
    "responsibilities": [
      "Conduct client intake assessments and develop individualized service plans.",
      "Provide counseling, crisis intervention, and resource referral services.",
      "Coordinate with government agencies, healthcare providers, and community organizations.",
      "Maintain detailed case records and progress documentation."
    ],
    "required_skills": ["Case Management", "Counseling", "Crisis Intervention", "Advocacy", "Client Assessment", "Communication"],
    "preferred_skills": ["Clinical Social Work", "Group Therapy", "Substance Abuse", "Child Welfare", "Community Organizing"],
    "tools": ["Case Management Software", "EHR", "Microsoft Office", "Community Resource Databases"],
    "education": "Bachelor's or Master's Degree in Social Work (BSW/MSW) with licensure",
    "experience_years": 3.0
  },

  # 27. Finance (Insurance & Banking)
  {
    "canonical_title": "Actuary",
    "alternative_titles": ["Actuarial Analyst", "Insurance Actuary", "Risk Analyst"],
    "occupation_code": "ISCO-08 2120",
    "industry": "Insurance & Risk",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Applies mathematical and statistical methods to assess financial risk, price insurance products, and model future financial scenarios.",
    "responsibilities": [
      "Build actuarial models for insurance pricing, reserving, and capital requirements.",
      "Analyze mortality, morbidity, and loss data to set premium rates.",
      "Prepare regulatory filings and actuarial reports for senior management.",
      "Evaluate financial risk exposure and recommend hedging strategies."
    ],
    "required_skills": ["Actuarial Science", "Statistical Modeling", "Risk Assessment", "Insurance Pricing", "Excel", "R or Python"],
    "preferred_skills": ["SAS", "Actuarial Exams (SOA/CAS)", "Reserving", "Catastrophe Modeling", "SQL"],
    "tools": ["Excel", "R", "Python", "SAS", "Actuarial Software"],
    "education": "Bachelor's Degree in Actuarial Science, Mathematics, or Statistics; Actuarial credentials required",
    "experience_years": 4.0
  },

  # 28. Biomedical & Aerospace Engineering
  {
    "canonical_title": "Biomedical Engineer",
    "alternative_titles": ["Medical Device Engineer", "Clinical Engineer", "Biotech Engineer"],
    "occupation_code": "ISCO-08 2149",
    "industry": "Biomedical Engineering",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Designs, develops, and tests medical devices, prosthetics, imaging systems, and biotech products to improve patient healthcare outcomes.",
    "responsibilities": [
      "Design and prototype medical devices using CAD tools and biocompatible materials.",
      "Conduct biocompatibility testing and regulatory compliance documentation (FDA, CE Mark).",
      "Collaborate with clinicians on product requirements and clinical trial protocols.",
      "Support manufacturing validation, sterilization processes, and quality management systems."
    ],
    "required_skills": ["Medical Device Design", "Biocompatibility", "CAD", "Regulatory Compliance", "Quality Management", "Clinical Trials"],
    "preferred_skills": ["FDA 510(k)", "ISO 13485", "3D Printing", "Signal Processing", "Biomechanics"],
    "tools": ["SolidWorks", "MATLAB", "Minitab", "FDA Databases", "CAD"],
    "education": "Bachelor's or Master's Degree in Biomedical Engineering or related field",
    "experience_years": 3.0
  },
  {
    "canonical_title": "Aerospace Engineer",
    "alternative_titles": ["Aircraft Engineer", "Avionics Engineer", "Space Systems Engineer"],
    "occupation_code": "ISCO-08 2144",
    "industry": "Aerospace & Aviation",
    "seniority": "Senior",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Designs, analyzes, and tests aircraft, spacecraft, satellites, and propulsion systems for commercial, defense, and space exploration applications.",
    "responsibilities": [
      "Design aerodynamic structures, propulsion systems, and flight control mechanisms.",
      "Perform CFD simulation, structural FEA, and thermal analysis on aerospace components.",
      "Ensure compliance with FAA, EASA, and NASA regulatory standards.",
      "Support flight testing, certification processes, and system integration."
    ],
    "required_skills": ["Aerospace Engineering", "Aerodynamics", "CFD", "FEA", "Propulsion", "Systems Engineering"],
    "preferred_skills": ["MATLAB", "CATIA", "ANSYS", "GNC", "Satellite Systems", "Avionics"],
    "tools": ["CATIA", "ANSYS", "MATLAB", "Simulink", "SolidWorks"],
    "education": "Bachelor's or Master's Degree in Aerospace or Aeronautical Engineering",
    "experience_years": 5.0
  },

  # 29. Agriculture & Energy
  {
    "canonical_title": "Agricultural Scientist",
    "alternative_titles": ["Agronomist", "Crop Scientist", "Agricultural Research Scientist"],
    "occupation_code": "ISCO-08 2131",
    "industry": "Agriculture & Food Science",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Conducts crop science research, soil analysis, pest management, and sustainable agriculture practices to improve food production yields.",
    "responsibilities": [
      "Conduct field trials and greenhouse experiments on crop varieties and treatments.",
      "Analyze soil composition, nutrient levels, and irrigation requirements.",
      "Develop integrated pest management (IPM) and sustainable farming strategies.",
      "Publish research findings and provide advisory recommendations to farming communities."
    ],
    "required_skills": ["Crop Science", "Soil Analysis", "Research", "Data Analysis", "Pest Management", "Sustainability"],
    "preferred_skills": ["GIS", "Remote Sensing", "Plant Genetics", "Precision Agriculture", "Statistical Software"],
    "tools": ["GIS", "SPSS", "Field Instruments", "Microscopes", "Excel"],
    "education": "Bachelor's or Master's Degree in Agricultural Science, Agronomy, or Plant Science",
    "experience_years": 3.0
  },
  {
    "canonical_title": "Energy Engineer",
    "alternative_titles": ["Renewable Energy Engineer", "Power Systems Engineer", "Energy Consultant"],
    "occupation_code": "ISCO-08 2151",
    "industry": "Energy & Utilities",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Designs and optimizes energy systems including solar, wind, battery storage, and smart grid infrastructure for sustainable power generation.",
    "responsibilities": [
      "Design solar PV, wind turbine, and battery energy storage system (BESS) installations.",
      "Perform energy audits, load analysis, and efficiency optimization assessments.",
      "Model energy generation, consumption forecasting, and grid integration scenarios.",
      "Ensure compliance with energy codes, utility interconnection standards, and environmental regulations."
    ],
    "required_skills": ["Renewable Energy", "Solar Design", "Energy Auditing", "Power Systems", "Grid Integration", "Sustainability"],
    "preferred_skills": ["PVsyst", "HOMER", "Battery Storage", "Smart Grid", "Energy Modeling", "LEED"],
    "tools": ["PVsyst", "AutoCAD", "HOMER", "Excel", "SCADA"],
    "education": "Bachelor's Degree in Electrical Engineering, Energy Engineering, or Mechanical Engineering",
    "experience_years": 3.0
  },

  # 30. Government & Public Administration
  {
    "canonical_title": "Public Policy Analyst",
    "alternative_titles": ["Policy Advisor", "Government Affairs Specialist", "Legislative Analyst"],
    "occupation_code": "ISCO-08 2422",
    "industry": "Government & Public Administration",
    "seniority": "Mid-Level",
    "country": "Global",
    "location": "Global / On-Site",
    "description": "Researches, analyzes, and recommends public policy solutions on social, economic, healthcare, education, and environmental issues.",
    "responsibilities": [
      "Conduct policy research, data analysis, and literature reviews on public issues.",
      "Draft policy briefs, white papers, and legislative recommendation documents.",
      "Analyze the fiscal and social impact of proposed legislation and regulations.",
      "Engage with stakeholders, government officials, and advocacy organizations."
    ],
    "required_skills": ["Policy Analysis", "Research", "Data Analysis", "Report Writing", "Stakeholder Engagement", "Public Speaking"],
    "preferred_skills": ["Regulatory Analysis", "Government Relations", "Grant Writing", "Economics", "Legislative Process"],
    "tools": ["Excel", "SPSS", "Stata", "Microsoft Office", "Government Databases"],
    "education": "Bachelor's or Master's Degree in Public Policy, Political Science, Economics, or Public Administration",
    "experience_years": 3.0
  }
]

def slugify(text: str) -> str:
    """Generate clean URL slug from title."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')

def seed_job_library(db: Session):
    """Seed occupations and job library database if records are absent."""
    existing_count = db.query(JobLibraryModel).count()
    if existing_count > 0:
        return  # Already seeded

    print("[Seeder] Populating Global Job & Job Description Library...")

    for item in GLOBAL_JOB_SEED_DATA:
        occ_id = f"occ_{uuid.uuid4().hex[:8]}"
        job_id = f"joblib_{uuid.uuid4().hex[:8]}"
        slug = slugify(f"{item['canonical_title']}-{item['seniority']}")

        # 1. Create Occupation Entry
        occ = OccupationsModel(
            id=occ_id,
            canonical_title=item["canonical_title"],
            alternative_titles=json.dumps(item["alternative_titles"]),
            occupation_code=item["occupation_code"],
            occupation_family=item["industry"],
            industry=item["industry"],
            description=item["description"],
            typical_responsibilities=json.dumps(item["responsibilities"]),
            common_skills=json.dumps(item["required_skills"]),
            tools=json.dumps(item["tools"]),
            certifications=json.dumps(item["preferred_skills"])
        )
        db.add(occ)

        # 2. Create Job Library Entry
        job_lib = JobLibraryModel(
            id=job_id,
            slug=slug,
            title=f"{item['seniority']} {item['canonical_title']}",
            normalized_title=item["canonical_title"],
            occupation_id=occ_id,
            company="Global Employment Partner",
            industry=item["industry"],
            location=item["location"],
            country=item["country"],
            employment_type="Full-time",
            seniority=item["seniority"],
            description=item["description"],
            responsibilities=json.dumps(item["responsibilities"]),
            required_skills=json.dumps(item["required_skills"]),
            preferred_skills=json.dumps(item["preferred_skills"]),
            education=item["education"],
            experience_years=item["experience_years"],
            tools=json.dumps(item["tools"]),
            is_generic_profile=True,
            source="ISCO-08 / ESCO Global Framework"
        )
        db.add(job_lib)

    db.commit()
    print(f"[Seeder] Successfully seeded {len(GLOBAL_JOB_SEED_DATA)} global job profiles!")
