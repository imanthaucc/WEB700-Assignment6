
/******************************************************************************** *  
 * WEB700 – Assignment 06 
*  
*	I declare that this assignment is my own work in accordance with Seneca's *  Academic Integrity Policy: 
*  
*	https://www.senecacollege.ca/about/policies/academic-integrity-policy.html 
*  
*	Name: M.I.U.Chandrasena Student ID: 147487235 Date: 10/08/2024 
* 
*	Published URL: ___________________________________________________________ 
* 
********************************************************************************/ 

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const collegeData = require('./collegeData');

const app = express();
const PORT = process.env.PORT || 8080;

// Configure Handlebars
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: {
        navLink: function (url, options) {
            const activeRoute = this.activeRoute || ''; // Make sure to provide activeRoute from req or elsewhere
            return '<li' +
                ((url === activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3) {
                throw new Error("Handlebars Helper equal needs 2 parameters");
            }
            return (lvalue !== rvalue) ? options.inverse(this) : options.fn(this);
        }
    }
});
app.use(express.static(path.join(__dirname, 'public')));
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes

// Route to serve the home view
app.get('/', (req, res) => {
    res.render('home', { title: 'Home Page' });
});

// Route to serve about.hbs
app.get('/about', (req, res) => {
    res.render('about');
});

// Route to serve htmlDemo.hbs
app.get('/htmlDemo', (req, res) => {
    res.render('htmlDemo');
});

// Route to render form to add a new student
app.get('/students/add', (req, res) => {
    collegeData.getCourses().then((courses) => {
        res.render('addStudent', { courses: courses });
    }).catch((err) => {
        res.status(500).send("Error retrieving courses: " + err);
    });
});

// Route to handle adding a new student
app.post('/students/add', (req, res) => {
    collegeData.addStudent(req.body).then(() => {
        res.redirect('/students');
    }).catch((err) => {
        res.status(500).send("Error adding student: " + err);
    });
});

// Route to render the student list
app.get('/students', (req, res) => {
    collegeData.getAllStudents().then((students) => {
        if (students.length > 0) {
            res.render('students', { students: students });
        } else {
            res.render('students', { message: "No students found" });
        }
    }).catch((err) => {
        res.status(500).send("Error retrieving students: " + err);
    });
});

// Route to render form to update a student
app.get('/students/update/:num', (req, res) => {
    let studentNum = req.params.num;
    let viewData = {};

    collegeData.getStudentByNum(studentNum).then((student) => {
        viewData.student = student;
        return collegeData.getCourses();
    }).then((courses) => {
        viewData.courses = courses;
        res.render('student', { viewData: viewData });
    }).catch((err) => {
        res.status(500).send("Error retrieving student or courses: " + err);
    });
});

// Route to handle updating a student
app.post('/student/update', (req, res) => {
    collegeData.updateStudent(req.body).then(() => {
        res.redirect('/students');
    }).catch((err) => {
        res.status(500).send("Error updating student: " + err);
    });
});

// Route to render form to add a new course
app.get('/courses/add', (req, res) => {
    res.render('addCourse');
});

// Route to handle adding a new course
app.post('/courses/add', (req, res) => {
    collegeData.addCourse(req.body).then(() => {
        res.redirect('/courses');
    }).catch((err) => {
        res.status(500).send("Error adding course: " + err);
    });
});

// Route to render course list
app.get('/courses', (req, res) => {
    collegeData.getCourses().then((courses) => {
        if (courses.length > 0) {
            res.render('courses', { courses: courses });
        } else {
            res.render('courses', { message: "No courses found" });
        }
    }).catch((err) => {
        res.status(500).send("Error retrieving courses: " + err);
    });
});

// Route to render form to update a course
app.get('/course/update/:id', (req, res) => {
    let courseId = req.params.id;

    collegeData.getCourseById(courseId).then((course) => {
        if (course) {
            res.render('updateCourse', { course: course });
        } else {
            res.status(404).send("Course Not Found");
        }
    }).catch((err) => {
        res.status(500).send("Error retrieving course: " + err);
    });
});

// Route to handle updating a course
app.post('/course/update', (req, res) => {
    collegeData.updateCourse(req.body).then(() => {
        res.redirect('/courses');
    }).catch((err) => {
        res.status(500).send("Error updating course: " + err);
    });
});

// Route to handle deleting a course
app.get('/course/delete/:id', (req, res) => {
    let courseId = req.params.id;
    collegeData.deleteCourseById(courseId).then(() => {
        res.redirect('/courses');
    }).catch((err) => {
        res.status(500).send("Unable to Remove Course / Course not found: " + err);
    });
});

// Route to handle deleting a student
app.get('/students/delete/:studentNum', (req, res) => {
    let studentNum = req.params.studentNum;
    collegeData.deleteStudentByNum(studentNum).then(() => {
        res.redirect('/students');
    }).catch((err) => {
        res.status(500).send("Unable to Remove Student / Student not found: " + err);
    });
});

// Route to render a student and their courses
app.get('/student/:studentNum', (req, res) => {
    let viewData = {};

    collegeData.getStudentByNum(req.params.studentNum).then((student) => {
        if (student) {
            viewData.student = student;
        } else {
            viewData.student = null;
        }
    }).catch((err) => {
        viewData.student = null;
    }).then(collegeData.getCourses).then((courses) => {
        viewData.courses = courses;

        // Find and mark the student's course as selected
        viewData.courses.forEach(course => {
            if (course.courseId == viewData.student.course) {
                course.selected = true;
            }
        });
    }).catch((err) => {
        viewData.courses = [];
    }).then(() => {
        if (viewData.student === null) {
            res.status(404).send("Student Not Found");
        } else {
            res.render('student', { viewData: viewData });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
