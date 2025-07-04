"use node";

import { MDocument } from "@mastra/rag";
import { internalAction } from "../_generated/server";
import { rag } from "../rag";

export const addCVEmbeddings = internalAction({
  args: {},
  handler: async (ctx) => {
    const doc = MDocument.fromJSON(
      JSON.stringify({
        personal_info: {
          name: "Dan Wu",
          email: "developerdanwu@gmail.com",
          profiles: {
            github: {
              username: "developerdanwu",
              url: "https://github.com/developerdanwu",
            },
            medium: {
              url: "https://medium.com/@developerdanwu",
            },
          },
        },
        summary:
          "I am a writer/designer turned software engineer that has a plethora of experience working on building complex applications, developing tooling and infrastructure for engineering teams. I work with designers, UX writers and product managers to develop systems, automations and processes. I balance business/engineering needs and organise chaos in growing teams.",
        skills_and_technology: [
          "Python",
          "JavaScript",
          "Selenium",
          "React",
          "NextJS",
          "FastAPI",
          "Mantine UI",
          "Tailwind CSS",
          "React Query",
          "Contentful",
          "GraphQL",
          "Clickup",
          "Github Actions",
          "Typescript",
          "Figma",
          "Jira",
          "Asana",
          "Agile Development",
          "Playwright",
        ],
        work_experience: [
          {
            company: "SleekFlow",
            position: "Senior Software Engineer (Frontend)",
            duration: "Jan 2023 - Present",
            achievements: [
              "As one of the first 20 members of the company, contributed or led most of the company's projects from marketing website, web app, partnership portal, livechat widget and web app revamp",
              "Core part of the foundations and architecture team that works on scaling and setting the technological vision for the company",
              "Lead the engineering effort and work with UI/UX designers and UX writers to build out core component UI library to be used in all products",
              "Directly managed Software Engineers to deliver a world class marketing website experience for users including technical SEO, regional content locking, improving site speeds - seen by over 2 million people every month and growing the marketing engineering team from 1 to 4",
              "Initiated and lead the migration of translation service of legacy and new codebases. Aligned the translation syntax to ICU across all code to reduce cognitive overhead for translation team",
              "Guide team of 10+ QA and QA lead on the technical side to scale testing infrastructure to speed up code deployments",
              "Head the contacts and broadcasts modules for the company's new web app revamp and exceeded timeline and scope expectations",
              "Part of the braintrust for re-architecting a struggling Inbox module and combining reactive programming and react in a novel way to handle realtime async operations",
              "Host whiteboarding sessions to discuss issues within frontend codebase to improve coding standards within the team and educating designers/developers on design systems",
            ],
            notable_projects: [
              {
                name: "SleekFlow UI component library",
                url: "non-public facing",
              },
              {
                name: "Marketing website",
                url: "https://sleekflow.io",
              },
              {
                name: "Flagship app",
                url: "https://app.sleekflow.io",
              },
              {
                name: "Partner hub",
                url: "https://partner.sleekflow.io",
              },
              {
                name: "V2 Flagship app",
                url: "https://beta.sleekflow.io",
              },
            ],
            technologies: [
              "NextJS",
              "React",
              "Mantine UI",
              "Tailwind CSS",
              "React Query",
              "Storybook",
              "Redux",
              "Contentful",
              "GraphQL",
              "Typescript",
              "Git",
              "Github",
              "Gitlab",
              "Material UI",
              "RXJS",
            ],
          },
          {
            company: "SleekFlow",
            position: "Software Engineer (Frontend)",
            duration: "Jan 2022 - Jan 2023",
            achievements: [
              "Oversaw the technical revamp and SEO effort for their marketing website",
              "Leading the localisation project for the marketing website and mentoring a Web Developer",
              "Give valuable peer reviews and code reviews on other colleagues pull requests",
            ],
          },
          {
            company: "Admazes",
            position: "Full stack web application developer",
            duration: "May 2021 - Jan 2022",
            achievements: [
              "Being the company's first employee, was solely responsible for the design/development of the company's flagship Influencer application from the backend, frontend to design",
              "The flagship app was chosen to enter Cyberport's Incubation programme",
              "Handled various other small projects for their other clients like automations through Google App Scripts and Wordpress websites",
              "Mentored two University students and helped them debug simple Javascript, Python and CSS issues",
            ],
            notable_projects: [
              {
                name: "Marketing website",
                url: "https://starnet.ai",
              },
              {
                name: "Flagship app",
                url: "https://app.starnet.ai",
              },
            ],
            technologies: [
              "React",
              "NextJS",
              "Google app scripts",
              "HTML",
              "CSS",
              "Chakra UI",
              "Python",
              "FastAPI",
              "SQLalchemy",
            ],
          },
        ],
        education: [
          {
            degree: "BA (Hons) 3D Design (Designer Maker)",
            institution: "Plymouth University",
            duration: "2016 - 2019",
          },
        ],
      })
    );

    const chunks = await doc.chunk({
      strategy: "json",
      overlap: 50,
      maxSize: 512,
    });

    await rag.add(ctx, {
      namespace: "cv",
      chunks: chunks,
    });
  },
});

export const addSoftwareEngineeringJourneyEmbeddings = internalAction({
  args: {},
  handler: async (ctx) => {
    const doc = MDocument.fromJSON(
      JSON.stringify({
        title: "Self-Taught Software Engineer Journey: From Art to Tech",
        author: "Dan Wu",
        document_type: "career_transition_story",
        main_theme: "career_change_to_software_engineering",

        story_structure: {
          foreword: {
            key_message:
              "No matter where you're from or what background you bring, you can definitely become a great engineer",
            target_audience:
              "people switching to tech from non-tech backgrounds",
            encouragement:
              "embrace your differences wholeheartedly and celebrate your differences",
          },

          background: {
            education: "BA in 3D Design specializing in ceramics (2019)",
            previous_careers: [
              "fine art",
              "architecture",
              "product design",
              "ceramics",
              "writer",
              "ceramics instructor",
            ],
            tech_experience_before_transition:
              "absolutely zero formal/professional technology background",
            timeline:
              "2014 high school completion → 2019 degree → 2021 software engineering transition",
          },

          motivation_for_change: {
            initial_exposure:
              "fall 2019 - short online course on iOS development",
            catalyst_event:
              "mid-2020 - father's abandoned WordPress site needed fixing",
            key_realization:
              "impressed that I could create something I could use just by typing a few lines",
          },

          learning_journey: {
            phase_1_getting_started: {
              biggest_obstacle: "deciding what language to learn first",
              advice:
                "it doesn't matter THAT much - better to just start with literally anything and pivot if you don't like it",
              first_choice:
                "HTML and CSS for instant gratification and visual feedback",
              resource: "freeCodeCamp Responsive Web Design Certification",
            },

            phase_2_first_project: {
              concept: "escape from tutorial land",
              project: "ceramics business website coded from scratch",
              timeline: "month 3 of learning, spent 1 month building",
              learning_style:
                "hit the ground running and learn from a real project",
              key_tool: "Google searches for everything",
            },

            phase_3_job_market_test: {
              timeline: "November 2021",
              skills_at_time: "only HTML and CSS",
              applications_sent: "15-20 places",
              callbacks_received: 3,
              technical_tests: "TutorCircle, Bowtie, and Citadel",
              result: "scored zero in all three, got 3 rejection letters",
              lesson: "You can't fake competence",
            },

            phase_4_mentorship: {
              how_it_started: "DM from experienced software engineer",
              first_code_review:
                "suggestions for OG tags, JavaScript for dates",
              impact: "pivotal turning point in development journey",
            },

            phase_5_structure_seeking: {
              consideration: "Masters programs in Computer Science",
              barrier: "required prior CS Bachelor's degrees",
              solution:
                "Online Associate's degree in Software Development at Champlain college (January 2021)",
              approach: "balanced school with practical projects",
            },

            phase_6_breakthrough: {
              timeline: "more than 4 months in",
              previous_attempts: "Swift and JavaScript - both left confused",
              breakthrough_language: "Python",
              why_python_worked:
                "syntax was quite easy to follow and almost read like English",
              structured_learning:
                "100 Days of Code: The Complete Python Pro Bootcamp by Dr Angela Yu",
              daily_routine: "4-5 hours daily at coffee shop for 2 months",
              intensity: "3-6 course days depending on difficulty",
            },

            phase_7_burnout_and_opportunities: {
              timeline: "mid-May 2021",
              state: "burnt out but completed Python course",
              reality_check: "thought was Python God but was pretty mediocre",
              projects_completed:
                "couple of simple projects in Flask and basic scripts",
            },
          },

          job_search_success: {
            first_opportunity: {
              source: "friend's friend running a startup",
              role: "Full-stack Developer",
              company_focus:
                "platform matching Influencers to companies for brand deals",
              interview_process:
                "phone screening with HTML and CSS questions + in-person meeting",
              outcome: "first job offer",
            },

            second_opportunity: {
              role: "Web Developer at larger local company",
              interview_mishap: "45 minutes late having gotten lost",
              salary: "higher than first offer",
              decision:
                "turned down higher salary for better tech stack opportunities",
            },

            decision_rationale:
              "chose lower salary job with modern tech stacks over higher salary WordPress work",
          },

          first_job_experience: {
            duration: "8 months",
            schedule: "4 days work + 1 day self-improvement",
            main_responsibility: "building flagship web app from ground up",
            technologies_learned: [
              "WordPress",
              "SQL",
              "React",
              "NextJS",
              "Google App Scripts",
              "JavaScript",
            ],
            business_scope: "tech, marketing, and website building for clients",
          },

          career_progression: {
            next_role: "full-time Frontend Engineer at SleekFlow",
            specialization_reason: "enjoyed the front-end more",
            timeline_at_writing: "3 months since transition",
          },
        },

        key_takeaways: [
          "It's good to have a plan, but there isn't a one size fits all journey. It's better to start and then pivot than wait for the perfect moment",
          "Everyone's on their own quest, take inspiration and tips from others but don't compare yourself because there's always someone out there 'better' than you",
          "F*** the haters, there's going to be people telling you you can't make it but I promise there's light at the end of the tunnel",
          "Enjoy the journey and celebrate the small victories. Coding's never going to get as excited as changing the background color of your first div bright pink again",
          "Get a job as soon as you can and find a mentor. Tutorials and Google are great but I guarantee you, you will learn 10x faster and with less effort with a good mentor to guide you",
        ],

        important_lessons: {
          language_selection: "doesn't matter that much - start with anything",
          tutorial_trap: "escape tutorial land early with real projects",
          competence: "you can't fake it - need real skills",
          mentorship: "crucial for accelerated learning",
          burnout: "normal part of the process, not reserved for lazy people",
          job_negotiation:
            "should have used competing offers as negotiating chips",
          company_selection:
            "prioritize learning opportunities over immediate salary",
        },

        timeline_summary: {
          "2014": "High school completion",
          "2019": "University graduation, brief iOS course exposure",
          "2020": "WordPress project catalyst, started HTML/CSS",
          "November 2020": "Failed technical interviews",
          "January 2021": "Started online degree + intensive Python learning",
          "May 2021": "Burnout, job offers, first tech position",
          "8_months_later": "Transition to SleekFlow as Frontend Engineer",
        },

        success_factors: [
          "visual learning preference",
          "project-based learning approach",
          "consistent daily practice",
          "seeking feedback and mentorship",
          "willingness to fail and learn",
          "practical application over theoretical knowledge",
          "networking and sharing progress publicly",
        ],
      })
    );

    const chunks = await doc.chunk({
      strategy: "json",
      overlap: 50,
      maxSize: 512,
    });

    await rag.add(ctx, {
      namespace: "career_transition_story",
      chunks: chunks,
    });
  },
});
