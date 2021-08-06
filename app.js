// Required Dependencies
const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

// Package to protect password
require('dotenv').config()

// Connect to database
const db = mysql.createConnection(
    {
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASS,
    database: 'employee_tracker'
    },
);

db.connect(err => {
    if (err) throw err;
    console.log('\n Connected to the Employee Tracker database!\n')
    toDo();
});

// Initial inquirer prompts
const toDo = () => {  
    inquirer
    .prompt([
        {
            type: 'list',
            name: 'toDo',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'View All Roles', 'View All Departments', 'Add Employee', 'Add Role', 'Add Department', 'Update Employee Role']
        }
    ])
    .then(data => {
        const { toDo } = data;

        if (toDo === 'View All Employees') {
            return viewAllEmployees();
        } else if (toDo === 'View All Roles') {
            return viewAllRoles();
        } else if (toDo === 'View All Departments') {
            return viewAllDepartments();
        } else if (toDo === 'Add Employee') {
            return addEmployee();
        } else if (toDo === 'Add Role') {
            return addRole();
        } else if (toDo === 'Add Department') {
            return addDepartment();
        } else if (toDo === 'Update Employee Role') {
            return updateEmployee();
        }
    })
};

// view all employees function
const viewAllEmployees = () => {
    const sql = `SELECT employee.id AS id, 
                        employee.first_name, 
                        employee.last_name, 
                        role.title, 
                        department.name AS department, 
                        role.salary,
                        CONCAT (manager.first_name, " ",manager.last_name) AS manager
                 FROM employee
                        LEFT JOIN role ON employee.role_id = role.id
                        LEFT JOIN department ON role.department_id = department.id
                        LEFT JOIN employee manager ON employee.manager_id = manager.id`;

    db.query(sql, (err, res) => {
        if (err) {
            console.log(err);
        }
        console.log("-----------------------------------------------------------------------------------")
        console.table(res)
        toDo();
    })
};

// view all rolles function
const viewAllRoles = () => {
    const sql = `SELECT role.title AS title, 
                        role.salary AS salary, 
                        department.name AS department
                 FROM role
                        JOIN department ON role.department_id = department.id`;

    db.query(sql, (err, res) => {
        if (err) {
            console.log(err);
        }
        console.log("--------------------------------------")
        console.table(res)
        toDo();
    })
};

// view all rolls function
const viewAllDepartments = () => {
    const sql = `SELECT department.name AS department FROM department`;

    db.query(sql, (err, res) => {
        if (err) {
            console.log(err);
        }
        console.log("-----------")
        console.table(res)
        toDo();
    })
};



// // query function for employee roles to use in addEmployees()
// managerQuery = () => {
//     const managerArray = [];

//     db.query(`SELECT CONCAT(first_name, " ", last_name) AS name FROM employee WHERE manager_id IS NULL`, (err, res) => {
//         if (err) {
//             console.log(err);
//         }
//         for (i = 0; i < res.length; i++){
//             managerArray.push(res[i])
//         }
//     })
//     return managerArray;
// };

// add employees prompts
const addEmployee = () => {
    
    inquirer
    .prompt([
        {
            type: 'input',
            name: 'firstName',
            message: "Enter employee's first name",
            validate: nameInput => {
                if (nameInput) {
                    return true;
                } else {
                    console.log("Please enter employee's first name!");
                }
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: "Enter employee's last name",
            validate: nameInput => {
                if (nameInput) {
                    return true;
                } else {
                    console.log("Please enter employee's last name!");
                }
            }
        }
    ])
    .then(answers => {
        const params = [answers.firstName, answers.lastName]

        // query function for employee roles
        db.query(`SELECT role.id, role.title FROM role`, (err, res) => {
            if (err) {
                console.log(err);
            }

            const roles = res.map(({ id, title}) => ({ name: title, value: id}));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'role',
                    message: "Enter employee's role",
                    choices: roles
                }
            ])
            .then(roleAnswer => {
                const role = roleAnswer.role
                params.push(role);

                db.query(`SELECT * FROM employee WHERE manager_id IS NULL`, (err, res) => {
                    if (err) {
                        console.log(err);
                    }
                    const managers = res.map(({ id, first_name, last_name }) => ({name: first_name + " " + last_name, value: id}))

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'manager',
                            message: "Enter employee's manager",
                            choices: managers
                        }
                    ])
                    .then(managerAnswer => {
                        const manager = managerAnswer.manager
                        params.push(manager);

                        db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                                  Values (?, ?, ?, ?)`, params, (err, res) => {
                                      if (err) {
                                          console.log(err);
                                      }
                                      console.log("-----------------------------------------------------------------------------------")
                                      console.log("Employee successfully added!")

                            viewAllEmployees();
                        })
                    });
                });
            });
        });
    });  
};
            
    
        




      

// add department prompts
const addDepartment = () => {
    inquirer
    .prompt([
        {
            type: 'input',
            name: 'departmet',
            message: "Enter department name",
            validate: departmentInput => {
                if (departmentInput) {
                    return true;
                } else {
                    console.log("Please enter department name!")
                }
           } 
        }
    ])
};

// add role prompts
const addRole = () => {
    inquirer
    .prompt([
        {
            type: 'input',
            name: 'role',
            message: "Enter role name",
            validate: roleInput => {
                if (roleInput) {
                    return true;
                } else {
                    console.log("Please enter role name!")
                }
           } 
        },
        {
            type: 'input',
            name: 'salary',
            message: "Enter role salary",
            validate: salaryInput => {
                if (salaryInput) {
                    return true;
                } else {
                    console.log("Please enter role salary!")
                }
           } 
        },
        {
            type: 'list',
            name: 'department',
            message: "Enter role department",
            choices: ['']
        }
    ])
};

// update employee prompts
const updateEmployee = () => {
    inquirer
    .prompt([
        {
            
        }
    ])
};
