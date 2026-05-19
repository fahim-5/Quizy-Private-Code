Registration Form Requirements

    Ensure that all fields are mandatory for both teachers and students.

    Users must fill in every input field before submitting the form.

    Do not allow form submission if any required field is empty.



Dashboard Update Requirements

From: http://localhost:5173/dashboard

    Remove all current statistics (Quizzes Taken, Average Score, etc.).

    Display a welcome message:

        “Welcome back, [Teacher Name]! 👋”

    Below the welcome message, show:

        Current date, time, and day (real-time)

    Add a “Create Quiz” button at the top of the quizzes section.

    Below it, display:

        The 4 most recent quizzes created by the teacher

    Add a “Add Course” button above the courses section.

    Below it, display:

        The 4 most recent courses the teacher has either created or enrolled in
 

 Course Creation & Dashboard Fix Requirements

    When a teacher creates a course, ensure the teacher’s ID is stored in the database with the course.

        This is required to identify the owner of the course.

    After course creation, the course must be linked to the teacher and retrievable using the teacher’s ID.

    On the dashboard (http://localhost:5173/dashboard):

        Display the created course in the “Your Courses” section.

        Only show courses where the teacher is the owner or enrolled.

    Fix the current issue:

        A course has already been created for Teacher1 (ID: 69e4968c1dc493054ed623ab)

        However, it is not appearing on the dashboard

        Ensure proper data fetching, filtering, and rendering logic so it displays correctly

    Verify:

        Backend correctly saves teacherId in the course

        API returns courses filtered by teacher

        Frontend properly fetches and renders the data
