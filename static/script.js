document.addEventListener("DOMContentLoaded", function () {
    fetchCourses();
    fetchAdmissions();
    fetchStudentsPerCourse();
    fetchStudentsPerDepartment();
    fetchStudentsScholarship();
    fetchSortedCUCET();
    document.getElementById("registerBtn").addEventListener("click", registerStudent);
    document.getElementById("admissionBtn").addEventListener("click", submitAdmission);
});
function fetchCourses() {
    fetch("http://127.0.0.1:5000/courses")
        .then(response => response.json())
        .then(data => {
            let courseSelect = document.getElementById("course");
            courseSelect.innerHTML = "<option value=''>Select Course (Total Fee)</option>";
            data.forEach(course => {
                let option = document.createElement("option");
                option.value = course.Course_ID;
                option.textContent = `${course.Course_Name} (₹${course.Fee})`; // Fixed syntax
                courseSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching courses:", error));
}

function registerStudent() {
    let name = document.getElementById("name").value.trim();
    let dob = document.getElementById("dob").value;
    let contact = document.getElementById("contact").value.trim();
    let email = document.getElementById("email").value.trim();

    if (!name || !dob || !contact || !email) {
        alert("All fields are required!");
        return;
    }

    let studentData = { name, dob, contact, email };

    fetch("http://127.0.0.1:5000/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("Error: " + data.error);
        } else {
            alert("Student Registered Successfully!");
            document.getElementById("studentForm").reset();
        }
    })
    .catch(error => console.error("Error registering student:", error));
}

function submitAdmission() {
    let studentId = document.getElementById("student_id").value.trim();
    let courseId = document.getElementById("course").value;
    let cucetScore = parseInt(document.getElementById("cucet_score").value.trim(), 10);

    if (!studentId || !courseId || !Number.isInteger(cucetScore)) {
        alert("All fields are required!");
        return;
    }

    let admissionData = { student_id: studentId, course_id: courseId, cucet_score: cucetScore };

    fetch("http://127.0.0.1:5000/admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(admissionData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("Error: " + data.error);
        } else {
            alert(`Admission Successful! Final Fee: ₹${data.final_fee}`); // Fixed backticks
            document.getElementById("admissionForm").reset();
        }
    })
    .catch(error => console.error("Error submitting admission:", error));
}

function fetchAdmissions() {
    fetch("http://127.0.0.1:5000/admissions") // Ensure correct API endpoint
        .then(response => response.json())
        .then(data => {
            let admissionsList = document.getElementById("admissionsList");

            if (!admissionsList) {
                console.error("Element with ID 'admissionsList' not found.");
                return;
            }

            admissionsList.innerHTML = "<h3>Admissions List</h3>";

            if (data.length === 0) {
                admissionsList.innerHTML += "<p>No admissions found.</p>";
                return;
            }

            let table = `
                <table border="1">
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Course ID</th>
                            <th>CUCET Score</th>
                            <th>Final Fee (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.forEach(admission => {
                table += `
                    <tr>
                        <td>${admission.Student_ID}</td>
                        <td>${admission.Course_ID}</td>
                        <td>${admission.CUCET_Score}</td>
                        <td>₹${admission.Final_Fee}</td>
                    </tr>
                `;
            });

            table += `</tbody></table>`;
            admissionsList.innerHTML += table;
        })
        .catch(error => console.error("Error fetching admissions:", error));
}


function fetchStudentsPerCourse() {
    fetch("/students-per-course")
        .then(response => response.json())
        .then(data => {
            let courseCountDiv = document.getElementById("studentsPerCourse");
            courseCountDiv.innerHTML = "<h3>Students Per Course</h3>";

            if (data.length === 0) {
                courseCountDiv.innerHTML += "<p>No data available.</p>";
                return;
            }

            // Create canvas for the chart
            courseCountDiv.innerHTML += `<canvas id="studentsPerCourseChart"></canvas>`;

            // Extract course names and student counts
            let courseNames = data.map(item => item.Course_Name);
            let studentCounts = data.map(item => item.Student_Count);

            // Generate random colors for the pie chart
            let backgroundColors = courseNames.map(() => 
                `#${Math.floor(Math.random()*16777215).toString(16)}`
            );

            // Initialize Chart.js
            let ctx = document.getElementById("studentsPerCourseChart").getContext("2d");
            new Chart(ctx, {
                type: "pie",
                data: {
                    labels: courseNames,
                    datasets: [{
                        label: "Students Per Course",
                        data: studentCounts,
                        backgroundColor: backgroundColors,
                        borderColor: "#ffffff",
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: "bottom"
                        }
                    }
                }
            });
        })
        .catch(error => console.error("Error fetching student count per course:", error));
}

function fetchStudentsPerDepartment() {
    fetch("http://127.0.0.1:5000/students-per-department")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            let container = document.getElementById("studentsPerDepartment");

            if (!container) {
                console.error("Element with ID 'studentsPerDepartment' not found.");
                return;
            }

            container.innerHTML = "<h3>Students Per Department</h3>";

            if (!data || data.length === 0) {
                container.innerHTML += "<p>No data available.</p>";
                return;
            }

            // Create a canvas element for the chart
            container.innerHTML += `<canvas id="studentsChart" width="400" height="400"></canvas>`;

            // Extract department names and student counts
            let labels = data.map(dept => dept.Dept_Name);
            let studentCounts = data.map(dept => dept.Student_Count);

            // Generate random colors for each section
            let backgroundColors = labels.map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`);

            // Create the Pie Chart using Chart.js
            let ctx = document.getElementById("studentsChart").getContext("2d");
            new Chart(ctx, {
                type: "pie",
                data: {
                    labels: labels,
                    datasets: [{
                        data: studentCounts,
                        backgroundColor: backgroundColors,
                        borderColor: "#fff",
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: "top"
                        }
                    }
                }
            });
        })
        .catch(error => console.error("Error fetching students per department:", error));
}


function fetchStudentsScholarship() {
    fetch("/students-scholarship")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            let scholarshipDiv = document.getElementById("studentsScholarship");

            if (!scholarshipDiv) {
                console.error("Element with ID 'studentsScholarship' not found.");
                return;
            }

            scholarshipDiv.innerHTML = "<h3>Students with More than 50% Scholarship</h3>";

            if (!data || data.length === 0) {
                scholarshipDiv.innerHTML += "<p>No students found.</p>";
                return;
            }

            let table = `
                <table border="1">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Final Fee (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.forEach(student => {
                table += `
                    <tr>
                        <td>${student.Name}</td>
                        <td>₹${student.Final_Fee}</td>
                    </tr>
                `;
            });

            table += `</tbody></table>`;
            scholarshipDiv.innerHTML += table;
        })
        .catch(error => console.error("Error fetching scholarship students:", error));
}
//SORTED CUCET
function fetchSortedCUCET() {
    fetch("/sorted-cucet")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            let cucetDiv = document.getElementById("sortedCUCET");

            if (!cucetDiv) {
                console.error("Element with ID 'sortedCUCET' not found.");
                return;
            }

            cucetDiv.innerHTML = "<h3>Students Sorted by CUCET Score</h3>";

            if (!data || data.length === 0) {
                cucetDiv.innerHTML += "<p>No students found.</p>";
                return;
            }

            let table = `
                <table border="1">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>CUCET Score</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.forEach(student => {
                table += `
                    <tr>
                        <td>${student.Name}</td>
                        <td>${student.CUCET_Score}</td>
                    </tr>
                `;
            });

            table += `</tbody></table>`;
            cucetDiv.innerHTML += table;
        })
        .catch(error => console.error("Error fetching sorted CUCET scores:", error));
}




