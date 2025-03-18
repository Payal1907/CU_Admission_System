from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pymysql
import os

app = Flask(__name__)
CORS(app)

# Database Connection Function
def get_db_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "Pa@190704"),  # Move to .env for security
        database=os.getenv("DB_NAME", "CU_Admission"),
        cursorclass=pymysql.cursors.DictCursor
    )

# Scholarship Calculation Function
def calculate_scholarship(cucet_score, fee):
    scholarship_table = [
        (90.01, 100, 1.00),
        (80, 90, 0.50),
        (70, 79.99, 0.40),
        (60, 69.99, 0.30),
        (50, 59.99, 0.25),
        (40, 49.99, 0.15),
    ]
    for min_score, max_score, discount in scholarship_table:
        if min_score <= cucet_score <= max_score:
            return fee * (1 - discount)
    return fee  # No discount if below 40

# Serve Frontend
@app.route('/')
def home():
    return render_template('index.html')

# Fetch Courses
@app.route("/courses", methods=["GET"])
def get_courses():
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM Course")
            courses = cursor.fetchall()
        conn.close()
        return jsonify(courses)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Register Student
@app.route("/students", methods=["POST"])
def register_student():
    data = request.json
    name = data.get("name")
    dob = data.get("dob")
    contact = data.get("contact")
    email = data.get("email")

    if not name or not dob or not contact or not email:
        return jsonify({"error": "All fields are required!"}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            sql = "INSERT INTO Student (Name, DOB, Contact, Email) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (name, dob, contact, email))
            conn.commit()
            student_id = cursor.lastrowid
        conn.close()
        return jsonify({"message": "Student registered successfully!", "student_id": student_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Submit Admission with Scholarship Calculation
@app.route("/admission", methods=["POST"])
def submit_admission():
    data = request.json
    student_id = data.get("student_id")
    course_id = data.get("course_id")
    cucet_score = data.get("cucet_score")

    if not student_id or not course_id or cucet_score is None:
        return jsonify({"error": "All fields are required!"}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # Fetch Course Fee
            cursor.execute("SELECT Fee FROM Course WHERE Course_ID = %s", (course_id,))
            course = cursor.fetchone()
            if not course:
                return jsonify({"error": "Course not found"}), 404
            
            fee = course["Fee"]
            final_fee = calculate_scholarship(cucet_score, fee)

            # Insert into Admission Table
            sql = "INSERT INTO Admission (Student_ID, Course_ID, CUCET_Score, Final_Fee) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (student_id, course_id, cucet_score, final_fee))
            conn.commit()
        conn.close()
        return jsonify({"message": "Admission Successful!", "final_fee": final_fee})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/admissions", methods=["GET"])
def get_admissions():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM Admission")
        admissions = cursor.fetchall()
    conn.close()
    return jsonify(admissions)

@app.route("/students-per-course", methods=["GET"])
def students_per_course():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT Course_Name, COUNT(A.Student_ID) as Student_Count FROM Admission A JOIN Course C ON A.Course_ID = C.Course_ID GROUP BY C.Course_ID")
        result = cursor.fetchall()
    conn.close()
    return jsonify(result)

@app.route("/students-per-department", methods=["GET"])
def students_per_department():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT D.Dept_Name, COUNT(A.Student_ID) as Student_Count FROM Admission A JOIN Course C ON A.Course_ID = C.Course_ID JOIN Department D ON C.Dept_ID = D.Dept_ID GROUP BY D.Dept_ID")
        result = cursor.fetchall()
    conn.close()
    return jsonify(result)

@app.route("/students-scholarship", methods=["GET"])
def students_scholarship():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT S.Name, A.Final_Fee FROM Admission A JOIN Student S ON A.Student_ID = S.Student_ID WHERE A.Final_Fee < (SELECT Fee FROM Course WHERE Course_ID = A.Course_ID) * 0.50")
        result = cursor.fetchall()
    conn.close()
    return jsonify(result)

@app.route("/sorted-cucet", methods=["GET"])
def sorted_cucet():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT S.Name, A.CUCET_Score FROM Admission A JOIN Student S ON A.Student_ID = S.Student_ID ORDER BY A.CUCET_Score DESC")
        result = cursor.fetchall()
    conn.close()
    return jsonify(result)

if __name__ == "__main__":  
    app.run(debug=True)





