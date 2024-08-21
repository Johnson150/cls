import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";


// POST - Create a new student
export const POST = async (req) => {
    try {
        const body = await req.json();
        const { name, hoursIn = 0, hoursScheduled = 0, timesBookedOff = 0, contact, tutorIds = [], scheduledClassIds = [], courseIds = [] } = body;

        console.log("Received data:", body);

        // Verify that all courses exist
        const existingCourses = await client.course.findMany({
            where: { id: { in: courseIds } }
        });

        if (existingCourses.length !== courseIds.length) {
            console.error("Some courses were not found in the database");
            throw new Error("One or more selected courses were not found.");
        }

        // Proceed to create the student with the associated tutors, courses, and scheduled classes
        const newStudent = await client.student.create({
            data: {
                name,
                hoursIn,
                hoursScheduled,
                timesBookedOff,
                contact,
                // Conditionally connect tutors if any
                ...(tutorIds.length > 0 && {
                    tutors: {
                        connect: tutorIds.map((tutorId) => ({
                            id: tutorId,
                        })),
                    },
                }),
                // Conditionally connect scheduled classes if any
                ...(scheduledClassIds.length > 0 && {
                    scheduledClasses: {
                        connect: scheduledClassIds.map((scheduledClassId) => ({
                            id: scheduledClassId,
                        })),
                    },
                }),
                // Use create to establish the relationship in the join table
                courses: {
                    create: existingCourses.map((course) => ({
                        course: {
                            connect: { id: course.id }
                        }
                    })),
                },
            },
        });

        console.log("Created student:", newStudent);
        return NextResponse.json(newStudent);
    } catch (error) {
        console.error("Error creating student:", error.message);
        return NextResponse.json(
            { message: "Error creating student", error: error.message },
            { status: 500 }
        );
    }
};


export const GET = async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const courseIdsParam = searchParams.get('courseIds');
        const courseIds = courseIdsParam ? courseIdsParam.split(',') : [];

        let students;

        if (courseIds.length > 0) {
            // Fetch students who are associated with any of the specified courses
            students = await client.student.findMany({
                where: {
                    courses: {
                        some: {
                            course: {
                                id: { in: courseIds },
                            },
                        },
                    },
                },
                select: {
                    id: true,
                    name: true,
                    hoursIn: true, // Corrected field name
                    hoursScheduled: true, // Corrected field name
                    timesBookedOff: true, // Corrected field name
                    contact: true,
                    tutors: {
                        select: {
                            id: true,
                            tutor: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    scheduledClasses: {
                        select: {
                            id: true, // Only selecting the ID field as no other fields are needed
                        },
                    },
                    courses: {
                        select: {
                            course: {
                                select: {
                                    id: true,
                                    courseName: true, // Assuming you want to include the course name
                                },
                            },
                        },
                    },
                },
            });

            if (!students.length) {
                return NextResponse.json({ message: "No students found for these courses" }, { status: 404 });
            }
        } else {
            // Fetch all students if no courseIds are provided
            students = await client.student.findMany({
                select: {
                    id: true,
                    name: true,
                    hoursIn: true, // Corrected field name
                    hoursScheduled: true, // Corrected field name
                    timesBookedOff: true, // Corrected field name
                    contact: true,
                    tutors: {
                        select: {
                            id: true,
                            tutor: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    scheduledClasses: {
                        select: {
                            id: true, // Only selecting the ID field as no other fields are needed
                        },
                    },
                    courses: {
                        select: {
                            course: {
                                select: {
                                    id: true,
                                    courseName: true, // Assuming you want to include the course name
                                },
                            },
                        },
                    },
                },
            });
        }

        return NextResponse.json(students);
    } catch (error) {
        console.error("Error fetching students:", error.message);
        return NextResponse.json(
            { message: "Error fetching students", error: error.message },
            { status: 500 }
        );
    }
};

