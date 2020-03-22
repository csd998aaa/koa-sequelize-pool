const Sequelize = require('sequelize')
/**
* @desc config
* @param config {database,user,password,host,dialect,port,pool}
*/
module.exports = function (dbConfig) {
    dbConfig.pool = dbConfig.pool ? dbConfig.pool : {
        max: 5,
        min: 0,
        idle: 10000
    }
    const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        port: dbConfig.port,
        pool: dbConfig.pool,
        define: {
            underscored: true,
        },
        logging: false, // 关闭控制台输出SQL语句
    })

    /**
     * @desc 定义模型，为每一个模型设置主键id、created、modified
     * @param name string
     * @param attributes object
     * @returns {Model<any, any, TAttributes> | Model}
     */
    const defineModel = (name, attributes) => {
        let attrs = {}
        if (!attributes.id) {
            attrs.id = {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            }
        }
        for (const key in attributes) {
            let value = attributes[key]
            if (typeof value === "object" && value["type"]) {
                value.allowNull = value.allowNull || false;
                attrs[key] = value;
            } else {
                attrs[key] = {
                    type: value,
                    allowNull: false
                }
            }
        }
        if (!attributes.created) {
            attrs.created = {
                type: Sequelize.BIGINT,
                allowNull: false
            }
        }
        if (!attributes.modified) {
            attrs.modified = {
                type: Sequelize.BIGINT,
                allowNull: false
            }
        }
        return sequelize.define(name, attrs, {
            tableName: name,
            timestamps: false,
            underscored: false,
            hooks: {
                beforeValidate: (obj) => {
                    let now = Date.now();
                    if (obj.isNewRecord) {
                        obj.created = now;
                        obj.modified = now;
                    } else {
                        obj.modified = now;
                    }
                }
            }
        })
    }

    const db = {
        defineModel,
        sequelize,
        Sequelize
    }

    // MARK: 添加原类型
    const dataTypes = Sequelize.DataTypes
    for (const dataType in dataTypes) {
        db[dataType] = dataTypes[dataType]
    }

    return db
}