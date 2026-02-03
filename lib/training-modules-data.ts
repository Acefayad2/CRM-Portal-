export interface TrainingModule {
  id: string
  title: string
  category: "licensing" | "cft" | "appointment"
  description: string
  duration: string
  lessons: Lesson[]
  progress: number
  completed: boolean
  thumbnail?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  id: string
  title: string
  description: string
  duration: string
  type: "video" | "reading" | "quiz" | "practice"
  content: string
  completed: boolean
  resources?: Resource[]
}

export interface Resource {
  id: string
  title: string
  type: "pdf" | "video" | "link" | "document"
  url: string
}

export const trainingModules: TrainingModule[] = [
  {
    id: "licensing-101",
    title: "Licensing Module",
    category: "licensing",
    description: "Complete guide to obtaining and maintaining your insurance license. Learn about state requirements, exam preparation, continuing education, and license renewal processes.",
    duration: "8 hours",
    progress: 0,
    completed: false,
    tags: ["licensing", "certification", "compliance", "state requirements"],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    lessons: [
      {
        id: "lic-1",
        title: "Introduction to Insurance Licensing",
        description: "Overview of insurance licensing requirements and the importance of proper certification.",
        duration: "30 min",
        type: "video",
        completed: false,
        content: "This lesson covers the fundamentals of insurance licensing, including why licensing is required, who needs a license, and the different types of insurance licenses available.",
        resources: [
          {
            id: "res-1",
            title: "State Licensing Requirements Guide",
            type: "pdf",
            url: "#",
          },
        ],
      },
      {
        id: "lic-2",
        title: "State-Specific Requirements",
        description: "Understanding the unique licensing requirements for different states.",
        duration: "45 min",
        type: "reading",
        completed: false,
        content: "Each state has its own set of requirements for insurance licensing. This lesson provides a comprehensive overview of state-specific regulations, application processes, and fees.",
      },
      {
        id: "lic-3",
        title: "Exam Preparation Strategies",
        description: "Tips and strategies for passing your insurance licensing exam on the first try.",
        duration: "60 min",
        type: "video",
        completed: false,
        content: "Learn proven study techniques, practice exam questions, and test-taking strategies to help you succeed on your licensing exam.",
        resources: [
          {
            id: "res-2",
            title: "Practice Exam Questions",
            type: "pdf",
            url: "#",
          },
        ],
      },
      {
        id: "lic-4",
        title: "Continuing Education Requirements",
        description: "Understanding CE requirements and how to maintain your license.",
        duration: "40 min",
        type: "reading",
        completed: false,
        content: "Most states require continuing education credits to maintain your license. This lesson explains CE requirements, approved courses, and renewal processes.",
      },
      {
        id: "lic-5",
        title: "License Renewal Process",
        description: "Step-by-step guide to renewing your insurance license.",
        duration: "30 min",
        type: "practice",
        completed: false,
        content: "Walk through the license renewal process, including deadlines, required documentation, and fees.",
      },
      {
        id: "lic-6",
        title: "Licensing Module Assessment",
        description: "Test your knowledge with a comprehensive quiz covering all licensing topics.",
        duration: "45 min",
        type: "quiz",
        completed: false,
        content: "Complete this assessment to demonstrate your understanding of insurance licensing requirements and processes.",
      },
    ],
  },
  {
    id: "cft-training",
    title: "CFT Training",
    category: "cft",
    description: "Comprehensive training on Client Financial Tools (CFT). Master financial planning software, client analysis tools, and how to effectively present financial solutions to clients.",
    duration: "12 hours",
    progress: 0,
    completed: false,
    tags: ["cft", "financial tools", "client analysis", "software"],
    createdAt: "2024-01-10",
    updatedAt: "2024-01-25",
    lessons: [
      {
        id: "cft-1",
        title: "CFT Platform Overview",
        description: "Introduction to the Client Financial Tools platform and its key features.",
        duration: "45 min",
        type: "video",
        completed: false,
        content: "Get familiar with the CFT platform interface, navigation, and core functionality. Learn how to access client data, run financial analyses, and generate reports.",
        resources: [
          {
            id: "res-3",
            title: "CFT User Guide",
            type: "pdf",
            url: "#",
          },
        ],
      },
      {
        id: "cft-2",
        title: "Client Data Entry and Management",
        description: "Learn how to accurately enter and manage client financial information.",
        duration: "60 min",
        type: "practice",
        completed: false,
        content: "Master the art of entering client data accurately, including income, expenses, assets, liabilities, and insurance coverage. Learn best practices for data validation and error prevention.",
      },
      {
        id: "cft-3",
        title: "Financial Analysis Tools",
        description: "Understanding and using CFT's financial analysis capabilities.",
        duration: "90 min",
        type: "video",
        completed: false,
        content: "Explore CFT's powerful financial analysis tools including cash flow analysis, net worth calculations, risk assessments, and gap analysis.",
        resources: [
          {
            id: "res-4",
            title: "Financial Analysis Examples",
            type: "pdf",
            url: "#",
          },
        ],
      },
      {
        id: "cft-4",
        title: "Generating Client Reports",
        description: "Create professional, comprehensive reports for your clients.",
        duration: "50 min",
        type: "practice",
        completed: false,
        content: "Learn how to generate and customize client reports, including financial summaries, recommendations, and action plans. Understand how to present complex financial information in an accessible format.",
      },
      {
        id: "cft-5",
        title: "Presenting Solutions to Clients",
        description: "Effective strategies for presenting financial solutions using CFT data.",
        duration: "75 min",
        type: "video",
        completed: false,
        content: "Master the art of client presentations using CFT-generated reports. Learn how to explain complex financial concepts, address client concerns, and close deals effectively.",
      },
      {
        id: "cft-6",
        title: "Advanced CFT Features",
        description: "Explore advanced features and shortcuts to maximize your efficiency.",
        duration: "60 min",
        type: "reading",
        completed: false,
        content: "Discover advanced CFT features including bulk operations, custom templates, integration capabilities, and time-saving shortcuts.",
      },
      {
        id: "cft-7",
        title: "CFT Training Assessment",
        description: "Test your CFT knowledge and skills with a comprehensive assessment.",
        duration: "60 min",
        type: "quiz",
        completed: false,
        content: "Complete this assessment to demonstrate your proficiency with CFT tools and your ability to use them effectively with clients.",
      },
    ],
  },
  {
    id: "appointment-training",
    title: "Appointment Training",
    category: "appointment",
    description: "Master the art of scheduling, conducting, and following up on client appointments. Learn proven techniques for appointment setting, preparation, execution, and follow-up.",
    duration: "10 hours",
    progress: 0,
    completed: false,
    tags: ["appointments", "scheduling", "client meetings", "sales"],
    createdAt: "2024-01-05",
    updatedAt: "2024-01-22",
    lessons: [
      {
        id: "apt-1",
        title: "The Art of Appointment Setting",
        description: "Learn proven techniques for getting clients to agree to appointments.",
        duration: "60 min",
        type: "video",
        completed: false,
        content: "Master the psychology and techniques behind successful appointment setting. Learn how to overcome objections, create urgency, and secure commitments from prospects.",
        resources: [
          {
            id: "res-5",
            title: "Appointment Setting Scripts",
            type: "pdf",
            url: "#",
          },
        ],
      },
      {
        id: "apt-2",
        title: "Pre-Appointment Preparation",
        description: "How to prepare effectively before meeting with a client.",
        duration: "45 min",
        type: "reading",
        completed: false,
        content: "Learn the essential steps for preparing for client appointments, including research, goal setting, material preparation, and mental preparation.",
      },
      {
        id: "apt-3",
        title: "Conducting Effective Appointments",
        description: "Best practices for running successful client appointments.",
        duration: "90 min",
        type: "video",
        completed: false,
        content: "Master the structure and flow of effective appointments. Learn how to build rapport, ask the right questions, present solutions, and handle objections during meetings.",
        resources: [
          {
            id: "res-6",
            title: "Appointment Checklist",
            type: "pdf",
            url: "#",
          },
        ],
      },
      {
        id: "apt-4",
        title: "Using Technology in Appointments",
        description: "Leverage digital tools to enhance your appointment experience.",
        duration: "40 min",
        type: "practice",
        completed: false,
        content: "Learn how to use calendar tools, video conferencing, screen sharing, and presentation software to conduct effective virtual and in-person appointments.",
      },
      {
        id: "apt-5",
        title: "Post-Appointment Follow-Up",
        description: "Critical follow-up strategies to convert appointments into clients.",
        duration: "50 min",
        type: "reading",
        completed: false,
        content: "Understand the importance of timely follow-up and learn proven strategies for staying top-of-mind with prospects after appointments.",
      },
      {
        id: "apt-6",
        title: "Handling Difficult Appointments",
        description: "Strategies for managing challenging client situations.",
        duration: "55 min",
        type: "video",
        completed: false,
        content: "Learn how to handle difficult clients, objections, cancellations, and no-shows professionally and effectively.",
      },
      {
        id: "apt-7",
        title: "Appointment Training Assessment",
        description: "Test your appointment skills with a comprehensive assessment.",
        duration: "45 min",
        type: "quiz",
        completed: false,
        content: "Complete this assessment to demonstrate your understanding of appointment best practices and your ability to conduct successful client meetings.",
      },
    ],
  },
]

export const trainingCategories = [
  {
    id: "all",
    name: "All Modules",
    description: "View all available training modules",
    icon: "BookOpen",
  },
  {
    id: "licensing",
    name: "Licensing",
    description: "Insurance licensing requirements and certification",
    icon: "GraduationCap",
  },
  {
    id: "cft",
    name: "CFT Training",
    description: "Client Financial Tools training and certification",
    icon: "Calculator",
  },
  {
    id: "appointment",
    name: "Appointment Training",
    description: "Master appointment setting and client meetings",
    icon: "Calendar",
  },
]
