import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqsSection() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-7 px-4 pt-16">
      <div className="space-y-2">
        <h2 className="font-semibold text-3xl md:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="max-w-2xl text-muted-foreground">
          Here are some common questions and answers that you might encounter
          when using Efferd. If you don't find the answer you're looking for,
          feel free to reach out.
        </p>
      </div>
      <Accordion
        className="w-full -space-y-px rounded-lg bg-card shadow dark:bg-card/50"
        collapsible
        defaultValue="item-1"
        type="single"
      >
        {questions.map((item) => (
          <AccordionItem
            className="relative border-x first:rounded-t-lg first:border-t last:rounded-b-lg last:border-b"
            key={item.id}
            value={item.id}
          >
            <AccordionTrigger className="px-4 py-4 text-[15px] leading-6 hover:no-underline">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-muted-foreground">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <p className="text-muted-foreground">
        Can't find what you're looking for? Contact our{" "}
        <a className="text-primary hover:underline" href="#">
          customer support team
        </a>
      </p>
    </div>
  );
}

const questions = [
  {
    id: "item-1",
    title: "What is the School Attendance Management System?",
    content:
      "The School Attendance Management System is a digital platform that helps schools track and manage student attendance efficiently. Teachers can mark attendance quickly, and administrators can access records and reports in real time.",
  },
  {
    id: "item-2",
    title: "Who can use this system?",
    content:
      "This system is designed for schools, including teachers, administrators, and school management. It helps them maintain accurate attendance records and monitor student presence easily.",
  },
  {
    id: "item-3",
    title: "What features does the system include?",
    content:
      "The system includes features such as digital attendance marking, automated attendance reports, student attendance tracking, class-wise records, and analytics to help schools monitor attendance trends and improve student participation.",
  },
  {
    id: "item-4",
    title: "Can teachers mark attendance easily?",
    content:
      "Yes. Teachers can mark attendance quickly through an easy-to-use interface. The system automatically records and stores the data for future reference.",
  },
  {
    id: "item-5",
    title: "Can administrators generate attendance reports?",
    content:
      "Yes. Administrators can generate detailed attendance reports by class, student, or date range, making it easier to track attendance patterns and maintain school records.",
  },
  {
    id: "item-6",
    title: "Is student attendance data secure?",
    content:
      "Yes. The system securely stores attendance records and ensures that only authorized users such as teachers and administrators can access the data.",
  },
  {
    id: "item-7",
    title: "How do I get started with the system?",
    content:
      "Getting started is simple. Schools can register their institution, add teachers and students, create classes, and begin recording attendance immediately.",
  },
];
