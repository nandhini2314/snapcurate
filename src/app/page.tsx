
// import { Button } from "@/components/ui/button";
// import { Logo } from "@/components/ui/logo";
// import { Container } from "@/components/ui/container";

// export default function Home() {
//   return (
//     <Container className="flex flex-col items-center justify-center min-h-screen">
//       <Logo className="transform transition-transform duration-500 hover:scale-110 mb-8" />
//       <h1 className="text-4xl font-bold mb-4">About Us</h1>
//       <p className="text-lg text-center mb-8">
//         We are committed to delivering the best services to our customers. Our team is dedicated to ensuring customer satisfaction and excellence in every project we undertake.
//       </p>
//       <Button>Let's explore</Button>
//     </Container>
//   );
// }
// Import necessary modules
import { PrismaClient } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/container";

// Initialize Prisma Client
const prisma = new PrismaClient();

async function fetchCourses() {
  // Fetch the latest 3 courses from the database
  const courses = await prisma.course.findMany({
    orderBy: {
      id: 'desc', // Assuming 'id' is a sequential identifier, otherwise use a timestamp field
    },
    take: 3,
  });
  return courses;
}

export default async function Home() {
  const courses = await fetchCourses();
  return (
    <Container className="flex flex-col items-center justify-center min-h-screen">
      <Logo className="transform transition-transform duration-500 hover:scale-110 mb-8" />
      <h1 className="text-4xl font-bold mb-4">About Us</h1>
      <p className="text-lg text-center mb-8 border p-4 max-w-2xl">
        At SnapCurate, we believe that quality education should be accessible, engaging, and tailored to each learner's journey. In a world overflowing with digital content, finding the right resources can be challenging. That's why we built SnapCurate — a platform designed to simplify learning by curating the best educational videos from YouTube and generating interactive quizzes to reinforce key concepts.
        Our mission is to create an intelligent, user-friendly experience that helps learners find the most relevant content without the hassle of endless searching. With SnapCurate, you can dive straight into learning, track your progress, and test your knowledge with quizzes designed to keep you engaged.
        Join us on a path to smarter learning, where content is curated for clarity and quizzes make understanding intuitive and fun!
      </p>
      <Link href="/gallery" className="mr-5 text-lg font-semibold text-blue-500 hover:underline">
        Let's Explore
      </Link>

      {/* New section for latest courses */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Latest Courses</h2>
        <div className="flex flex-wrap justify-center">
          {courses.map(course => (
            <Link key={course.id} href={`/course/${course.id}/0/0`} legacyBehavior>
              <a className="m-4">
                <Image
                  src={course.image}
                  alt={course.name}
                  width={200}
                  height={150}
                  className="rounded-lg shadow-lg"
                />
                <h3 className="text-xl font-semibold mt-2 text-center">{course.name}</h3>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}