import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";



// POST - Create a new tutor
export const POST = async (req) => {
    try {
        const body = await req.json();
        const { name, contact, studentIds = [], scheduledClassIds = [], courseIds = [] } = body;

        console.log("Received data:", body);

        // Verify that all courses exist
        const existingCourses = await client.course.findMany({
            where: { id: { in: courseIds } }
        });

        if (existingCourses.length !== courseIds.length) {
            console.error("Some courses were not found in the database");
            throw new Error("One or more selected courses were not found.");
        }

        // Proceed to create the tutor with the associated students, courses, and scheduled classes
        const newTutor = await client.tutor.create({
            data: {
                name,
                contact,
                // Conditionally connect students if any
                ...(studentIds.length > 0 && {
                    students: {
                        connect: studentIds.map((studentId) => ({
                            id: studentId,
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

        console.log("Created tutor:", newTutor);
        return NextResponse.json(newTutor);
    } catch (error) {
        console.error("Error creating tutor:", error.message);
        return NextResponse.json(
            { message: "Error creating tutor", error: error.message },
            { status: 500 }
        );
    }
};

// GET - Fetch tutors associated with specified course(s) or all tutors, including archived
export const GET = async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const courseIdsParam = searchParams.get('courseIds');
        const includeArchived = searchParams.get('includeArchived') === 'true';
        const courseIds = courseIdsParam ? courseIdsParam.split(',') : [];

        let tutors;

        if (courseIds.length > 0) {
            // Fetch tutors associated with any of the specified courses
            tutors = await client.tutor.findMany({
                where: {
                    courses: {
                        some: {
                            course: {
                                id: { in: courseIds },
                            },
                        },
                    },
                    archived: includeArchived ? undefined : false, // Exclude archived by default
                },
                select: {
                    id: true,
                    name: true,
                    contact: true,
                    archived: true, // Include archived status
                    students: {
                        select: {
                            id: true,
                            student: {
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
                                    courseName: true, // Including the course name
                                },
                            },
                        },
                    },
                },
            });

            if (!tutors.length) {
                return NextResponse.json({ message: "No tutors found for these courses" }, { status: 404 });
            }
        } else {
            // Fetch all tutors if no courseIds are provided
            tutors = await client.tutor.findMany({
                where: {
                    archived: includeArchived ? undefined : false, // Exclude archived by default
                },
                select: {
                    id: true,
                    name: true,
                    contact: true,
                    archived: true, // Include archived status
                    students: {
                        select: {
                            id: true,
                            student: {
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
                                    courseName: true, // Including the course name
                                },
                            },
                        },
                    },
                },
            });
        }

        return NextResponse.json(tutors);
    } catch (error) {
        console.error("Error fetching tutors:", error.message);
        return NextResponse.json(
            { message: "Error fetching tutors", error: error.message },
            { status: 500 }
        );
    }
};


