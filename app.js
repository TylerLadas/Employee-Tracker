// Required Dependencies
const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const chalk = require('chalk')

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
    console.log(chalk.redBright.bgBlue('---------------------------------------------'))
    console.log(chalk.redBright.bgBlue.bold('|            Employee Tracker               |'))
    console.log(chalk.redBright.bgBlue('---------------------------------------------'))
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
            return updateEmployeeRole();
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

                            toDo();
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
            name: 'department',
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
    .then(answer => {

        db.query(`INSERT INTO department (name) VALUES (?)`, answer.department, (err, res) => {
            if (err) {
                console.log(err);
            }
            console.log("------------------------------");
            console.log("Department successfully added!");
            console.log("------------------------------");

            toDo();
        })
    })
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
                    console.log("Please enter role salary!");
                }
           } 
        }
    ])
        .then(answers => {
            const params = [answers.role, answers.salary]
            
            db.query(`SELECT * FROM department`, (err, res) => {
                if (err) {
                    console.log(err);
                }
                const departments = res.map(({id, name}) => ({name: name, value: id}));

                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'department',
                        message: "Enter role department",
                        choices: departments
                    }
                ])
                .then(deptanswer => {
                    const department = deptanswer.department;
                    params.push(department);

                    db.query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`, params, (err, res) => {
                        if (err) {
                            console.log(err);
                        }
                        console.log("------------------------");
                        console.log("Role successfully added!");
                        console.log("------------------------");
            
                        toDo();
                });
            });
        });
    });
};

// update employee prompts
const updateEmployeeRole = () => {
    
    db.query(`SELECT * FROM employee`, (err, res) => {
        if(err) {
            console.log(err);
        }
        const employees = res.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));
        
        inquirer
        .prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'Select employee to update',
                choices: employees
            }
        ])
        .then(empAnswer => {
            const emp = empAnswer.employee;
            const params = []

            params.push(emp);
            console.log(params);
            db.query(`SELECT * FROM role`, (err,res) => {
                if(err) {
                    console.log(err)
                }
                const roles = res.map(({id, title}) => ({name: title, value: id}))

                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'roles',
                        message: 'Select new role',
                        choices: roles
                    }
                ])
                .then(roleAnswer => {
                    const role = roleAnswer.roles;
                    params.push(role);

                    console.log(params)
                    
                    // change order of params in order to insert proper values into employee
                    params[0] = role;
                    params[1] = emp;

                    db.query(`UPDATE employee SET role_id = ? WHERE id = ?`, params, (err, res) => {
                        if(err) {
                        console.log(err)
                        }
                        console.log("-----------------------------------");
                        console.log("Employee role successfully updated!");
                        console.log("-----------------------------------");
            
                        toDo();    
                    })
                })
            })
        }) 
    })
};
