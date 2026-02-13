const { uuid } = require('uuidv4')
const fs = require('fs')
const path = require('path')
const dbFilePath = path.join(__dirname, 'db.json')

function readDb() {
    const raw = fs.readFileSync(dbFilePath, 'utf-8')
    return JSON.parse(raw)
}

function writeDb(data) {
    const jsonData = JSON.stringify(data, null, 2)
    fs.writeFileSync(dbFilePath, jsonData, 'utf-8')
}

const UserModel = {
    getAllUsers() {
        return readDb()
    },
    findUserByUsername(username) {
        const db = readDb()
        let users = db.filter(user => user.username === username)
        return users && users.length > 0 ? users[0] : null
    },
    getUserById(id) {
        const db = readDb()
        return db.filter(user => user.id === id)
    },
    insertUser(inputData) {
        const db = readDb()
        if(inputData) {
            inputData.id = uuid()
        }
        db.push(inputData)
        writeDb(db)
    },
    updateUser(data, userId) {
        let db = readDb()
        db = db.map(user => {
            if(user.id === userId) {
                return { ...user, ...data }
            }
            return user
        })
        writeDb(db)
    },
    delUser(id) {
        let db = readDb()
        db = db.filter(user => user.id !== id)
        writeDb(db)
    }
}
module.exports = UserModel