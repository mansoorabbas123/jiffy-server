import _sequelize from "sequelize";
import crypto from 'crypto';

const { Model } = _sequelize;

export default class Client extends Model {
    static init(sequelize, DataTypes) {
        super.init({
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            email: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            hashedPassword: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            salt: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            passwordResetToken: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            address: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            phone: {
                type: DataTypes.STRING(20),
                allowNull: true
            },
            photoURL: {
                type: DataTypes.STRING(300),
                allowNull: true
            },
            address: {
                type: DataTypes.STRING(200),
                allowNull: true
            },
            otp: {
                type: DataTypes.STRING(20),
                allowNull: true
            },
            otpValidTill: {
                type: DataTypes.DATE(),
                allowNull: true
            },
            verified: {
                type: DataTypes.BOOLEAN(),
                defaultValue: false,
            }
        }, {

            sequelize,
            tableName: 'Client',
            timestamps: true,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "id" },
                    ]
                },
                {
                    name: "email",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "email" },
                    ]
                }
            ]
        });
        return Client;
    }
}
Client.prototype.toJSON = function () {
    var values = this.get()
    delete values.hashedPassword
    delete values.salt
    delete values.otp
    delete values.otpValidTill
    delete values.passwordResetToken
    delete values.verified
    return values
}

Client.prototype.makeSalt = function () {
    return crypto.randomBytes(16).toString('base64')
}

Client.prototype.authenticate = function (plainText) {
    return (
        this.encryptPassword(plainText, this.salt).toString() ===
        this.hashedPassword.toString()
    )
}

Client.prototype.encryptPassword = function (password, salt) {
    if (!password || !salt) {
        return ''
    }
    salt = new Buffer.from(salt, 'base64')
    return crypto
        .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
        .toString('base64')
}