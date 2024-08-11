const Sequelize = require('sequelize');

const sequelize = new Sequelize('ImanthaDB', 'ImanthaDB_owner', 'ChzQK90uIOos', {
    host: 'ep-patient-sky-a513t755.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define the Student model
const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING,
    courseCode: Sequelize.STRING  // This aligns with the courseCode field in the Course model
});

// Define the Course model
const Course = sequelize.define('Course', {
    courseCode: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    courseDescription: Sequelize.STRING
});

// Establish relationship: A Course has many Students
Course.hasMany(Student, { foreignKey: 'courseCode' });
Student.belongsTo(Course, { foreignKey: 'courseCode' }); // Added to ensure the relationship is established in both directions

// Initialize the database and sync models
module.exports.initialize = function () {
    return sequelize.sync()
        .then(() => Promise.resolve())
        .catch((err) => Promise.reject("Unable to sync the database: " + err));
};

// Get all students
module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then((students) => {
                resolve(students);
            })
            .catch((err) => Promise.reject("Error retrieving students: " + err));

    });

};

// Get all courses
module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then((courses) => {

                resolve(courses);
            })
            .catch((err) => reject("Error retrieving courses: " + err));
    });

};

// Get student by number
module.exports.getStudentByNum = function (num) {
    return Student.findOne({ where: { studentNum: num } })
        .then((student) => {
            if (!student) {
                return Promise.reject("No student found with number: " + num);
            }
            return Promise.resolve(student);
        })
        .catch((err) => Promise.reject("Error retrieving student: " + err));
};

// Get students by course code
module.exports.getStudentsByCourse = function (courseCode) {
    return Student.findAll({ where: { courseCode: courseCode } })
        .then((students) => {
            if (students.length === 0) {
                return Promise.reject("No students found for course code: " + courseCode);
            }
            return Promise.resolve(students);
        })
        .catch((err) => Promise.reject("Error retrieving students for course code: " + err));
};

// Get course by code
module.exports.getCourseById = function (id) {
    return Course.findOne({ where: { courseCode: id } })
        .then((course) => {
            if (!course) {
                return Promise.reject("No course found with id: " + id);
            }
            return Promise.resolve(course);
        })
        .catch((err) => Promise.reject("Error retrieving course: " + err));
};

// Add a student
module.exports.addStudent = function (studentData) {
    studentData.TA = (studentData.TA === 'true'); // Convert string 'true'/'false' to boolean
    for (let key in studentData) {
        if (studentData[key] === "") {
            studentData[key] = null;
        }
    }

    return Student.create(studentData)
        .then(() => Promise.resolve())
        .catch((err) => Promise.reject("Unable to create student: " + err));
};

// Update a student
module.exports.updateStudent = function (studentData) {
    studentData.TA = (studentData.TA === 'true'); // Convert string 'true'/'false' to boolean
    for (let key in studentData) {
        if (studentData[key] === "") {
            studentData[key] = null;
        }
    }

    return Student.update(studentData, { where: { studentNum: studentData.studentNum } })
        .then((result) => {
            if (result[0] === 0) {
                return Promise.reject("No student updated, student number may not exist");
            }
            return Promise.resolve();
        })
        .catch((err) => Promise.reject("Unable to update student: " + err));
};

// Add a course
module.exports.addCourse = function (courseData) {
    for (let key in courseData) {
        if (courseData[key] === "") {
            courseData[key] = null;
        }
    }

    return Course.create(courseData)
        .then(() => Promise.resolve())
        .catch((err) => Promise.reject("Unable to create course: " + err));
};

// Update a course

module.exports.updateCourse = function (courseData) {
    for (let key in courseData) {
        if (courseData[key] === "") {
            courseData[key] = null;
        }
    }
    return Course.update(courseData, { where: { courseCode: courseData.courseCode } })
        .then((result) => {
            if (result[0] === 0) {
                return Promise.reject("No course updated, course code may not exist");
            }
            return Promise.resolve();
        })
        .catch((err) => Promise.reject("Unable to update course: " + err));
};


// Delete a course by ID
module.exports.deleteCourseById = function (id) {
    return Course.destroy({ where: { courseCode: id } })
        .then((result) => {
            if (result === 0) {
                return Promise.reject("No course deleted, course code may not exist");
            }
            return Promise.resolve();
        })
        .catch((err) => Promise.reject("Unable to delete course: " + err));
};

// Delete a student by number
module.exports.deleteStudentByNum = function (studentNum) {
    return Student.destroy({ where: { studentNum: studentNum } })
        .then((result) => {
            if (result === 0) {
                return Promise.reject("No student deleted, student number may not exist");
            }
            return Promise.resolve();
        })
        .catch((err) => Promise.reject("Unable to delete student: " + err));
};
