import client from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// POST - Create a new student
export const POST = async (req) => {
    try {
        const body = await req.json();
        const { name, contact, tutorIds = [], scheduledClassIds = [], courseIds = [] } = body;

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
                contact,
                // Conditionally connect tutors if any
                ...(tutorIds.length > 0 && {
                    tutors: {
                        connect: tutorIds.map((tutorId) => ({
                            tutorId,
                        })),
                    },
                }),
                // Conditionally connect scheduled classes if any
                ...(scheduledClassIds.length > 0 && {
                    scheduledClasses: {
                        connect: scheduledClassIds.map((scheduledClassId) => ({
                            scheduledClassId,
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
        const scheduleIdParam = searchParams.get('scheduleId');
        const includeArchived = searchParams.get('includeArchived') === 'true';
        const courseIds = courseIdsParam ? courseIdsParam.split(',') : [];

        console.log('Incoming parameters:', { courseIdsParam, scheduleIdParam, includeArchived });

        let students;

        if (scheduleIdParam) {
            console.log('Fetching students by scheduleId:', scheduleIdParam);

            students = await client.student.findMany({
                where: {
                    scheduledClasses: {
                        some: {
                            scheduledClassId: scheduleIdParam,
                        },
                    },
                    archived: includeArchived ? undefined : false, // Exclude archived by default
                },
                select: {
                    id: true,
                    name: true,
                    contact: true,
                    archived: true,
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
                            id: true,
                        },
                    },
                    courses: {
                        select: {
                            course: {
                                select: {
                                    id: true,
                                    courseName: true,
                                },
                            },
                        },
                    },
                },
            });

        } else if (courseIds.length > 0) {
            console.log('Fetching students by courseIds:', courseIds);

            students = await client.student.findMany({
                where: {
                    courses: {
                        some: {
                            courseId: { in: courseIds },
                        },
                    },
                    archived: includeArchived ? undefined : false, // Exclude archived by default
                },
                select: {
                    id: true,
                    name: true,
                    contact: true,
                    archived: true,
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
                            id: true,
                        },
                    },
                    courses: {
                        select: {
                            course: {
                                select: {
                                    id: true,
                                    courseName: true,
                                },
                            },
                        },
                    },
                },
            });
        } else {
            console.log('Fetching all students');

            students = await client.student.findMany({
                where: {
                    archived: includeArchived ? undefined : false, // Exclude archived by default
                },
                select: {
                    id: true,
                    name: true,
                    contact: true,
                    archived: true,
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
                            id: true,
                        },
                    },
                    courses: {
                        select: {
                            course: {
                                select: {
                                    id: true,
                                    courseName: true,
                                },
                            },
                        },
                    },
                },
            });
        }

        // Log the students fetched
        console.log('Fetched students:', JSON.stringify(students, null, 2));

        console.log('Students fetched:', students.length);
        return NextResponse.json(students);
    } catch (error) {
        console.error("Error fetching students:", error.message);
        return NextResponse.json(
            { message: "Error fetching students", error: error.message },
            { status: 500 }
        );
    }
};

