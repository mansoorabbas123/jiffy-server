2841172
###Installation and Running

**Installation (Linux/MacOS only)**

`sh setup.sh` this script install the proper node version and install node module. Run this first

**Npm**

` npm run start` use this command to run the app directly 

for production use `NODE_ENV=production npm run start `

**PM2**

An ecosystem file is already created in the path. Use `pm2 start ecosystem.json`  to run using pm2



#### End Points

**Users**

| Method | Route                   | Description                                                  |
| ------ | ----------------------- | ------------------------------------------------------------ |
| GET    | `/user`                 | Get **N** users. N is defind by `limit` param. Default 20    |
| GET    | `/user/:id`             | Get details of a user with id                                |
| POST   | `/user`                 | Add new user                                                 |
| PATCH  | `/user/:id`             | Update existing user                                         |
| DELETE | `/user/:id`             | Delete existing user with id                                 |

**Comments**

| Method | Route                   | Description                                                  |
| ------ | ----------------------- | ------------------------------------------------------------ |
| GET    | `/comments/topmentions` | Get top **N** mentions with count defind by `limit`. Default 20 |
| GET    | `/comments/tophastags`  | Get top **N** hashtags with count defind by `limit`. Default 20 |
| GET    | `/comments/:id`         | Get comment object with id                                   |
| GET    | `/comments`             | Get **N** comments. N is defind by `limit` param. Default 20 |
| GET    | `/comments/user/:id`    | Get **N** comments of user with id. N is defind by `limit` param. Default 20 |
| POST   | `/comments`             | Post a new comment                                           |
| PATCH  | `/comments/:id`         | update existing comment with id                              |
| DELETE | `/comments/:id`         | delete existing comment with id                              |



#### Generic Error Response

```json
{
  "error":"error message",
  "message": "developer friendly message",
  "statusCode" : 500
}
```

#### Validation Error Response

```json
{
    "statusCode": 400,
    "error": "Bad Request",
    "message": "celebrate request validation failed",
    "validation": {
        "body": {
            "source": "body",
            "keys": [
                "lastName"
            ],
            "message": "\"lastName\" is required"
        }
    }
}
```

#### Data Success Response (for apis that responds with documents)

```json
{
    "statusCode": 200,
    "data": [
        {
            "contact": {
                "firstName": "bilal",
                "lastName": "ashraf",
                "email": "bilalashraf03@gmail.com"
            },
            "role": "user",
            "timestamp": 1611491140,
            "_id": "600c34c1aa2f8659dd752874",
            "username": "bilal",
            "createdAt": "2021-01-23T14:37:53.847Z",
            "updatedAt": "2021-01-23T14:37:53.847Z",
            "__v": 0
        },
        {
            "contact": {
                "firstName": "bilal2",
                "lastName": "ashraf2",
                "email": "bilalashraf04@gmail.com"
            },
            "role": "user",
            "timestamp": 1611491140,
            "_id": "600c38567d1d665cff4300ec",
            "username": "bilal2",
            "createdAt": "2021-01-23T14:53:10.911Z",
            "updatedAt": "2021-01-23T14:53:10.911Z",
            "__v": 0
        }
    ],
    "info": {}
}
```

#### Info Success Response (for deletion etc)

```json
{
    "statusCode": 200,
    "data": {},
    "info": {
        "n": 0,
        "ok": 1,
        "deletedCount": 0
    }
}
```

sql pass qwer1234



http Error Codes

409 for duplication
403 for permission access
200 for success
500 internal server error
401 for failed Login Authorization


ALTER TABLE `SafeHouse` ADD `fakeLocation` TEXT NOT NULL AFTER `phone`, ADD `facilities` TEXT NOT NULL AFTER `fakeLocation`, ADD `gender` VARCHAR(10) NOT NULL AFTER `facilities`, ADD `maxAgeLimit` INT NOT NULL DEFAULT '100' AFTER `gender`, ADD `minAgeLimit` INT NOT NULL DEFAULT '0' AFTER `maxAgeLimit`;