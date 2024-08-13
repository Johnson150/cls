import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// Function to handle GET requests to fetch all courses
export const GET = async () => {
    try {
        const courses = await client.course.findMany();

        // Ensure all grades are treated as strings
        const processedCourses = courses.map(course => ({
            ...course,
            grade: course.grade?.toString() || null,
        }));

        return NextResponse.json(processedCourses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return NextResponse.json(
            { message: "Error fetching courses", error: error.message },
            { status: 500 }
        );
    }
};
