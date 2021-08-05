// Required Dependencies
const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

// Package to protect password
require('dotenv').config()

// Connect to database
mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: process.env.DB_PASS,
      database: 'election'
    },
    console.log('Connected to the Employee Tracker database!')
);

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
                    console.log("Please enter employee's first name!")
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
                    console.log("Please enter employee's last name!")
                }
            }
        },
        {
            type: 'list',
            name: 'role',
            message: "Enter employee's role",
            choices: ['']
        },
        {
            type: 'list',
            name: 'manager',
            message: "Enter employee's manager",
            choices: ['']
        },
    ])
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

addRole();