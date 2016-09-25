import Rx from "rx";




class MySql {
    constructor(opts) {
        this.opts = opts;
    }

    query(sql, cb) {
        cb(null, sql);
    }
}

class Orm {
    constructor(opts) {
        this.opts = opts;
        this.tableName = "";
        this.start = -1;
        this.offset = -1;
        this.sql = '';
        this.findSql = `SELECT *`;
        this.deleteSql = `DELETE`;
        this.updateSql = `UPDATE`;
        this.insertSql = `INSERT`;
        this.mySql = new MySql(this.opts);
    }

    table(tableName) {
        this.tableName = tableName;
        return this;
    }

    skip(start) {
        this.start = start;
        return this;
    }

    limit(offset) {
        this.offset = offset;
        return this;
    }

    where(sql) {
        this.sql = ` OR ${sql}`;
        return this;
    }

    find() {
        let sql = "";

        sql = this.findSql.concat(` FROM ${this.tableName} WHERE 1=1`).concat(this.sql);

        if (!(this.start === -1)) {
            sql = sql.concat(` SKIP ${this.start}`)
            this.start = -1;
        }

        if (!(this.offset === -1)) {
            sql = sql.concat(` LIMIT ${this.offset}`)
            this.offset = -1;
        }

        let that = this;

        return new Promise((resolve, reject) => {
            that.mySql.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    findOne() {
        return this.skip(0).limit(1).find();
    }

    delete() {

        let that = this;

        return new Promise((resolve, reject) => {
            that.mySql.query(this.deleteSql, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    update(sql) {
        this.updateSql.concat(sql);
        let that = this;
        return new Promise((resolve, reject) => {
            that.mySql.query(this.updateSql, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    insert(sql) {
        let that = this;
        this.insertSql.concat(sql);
        return new Promise((resolve, reject) => {
            that.mySql.query(this.insertSql, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
}


let orm = new Orm({
    connection: {
        host: "123.0.0.1",
        port: 10,
        user: "root",
        password: "fdsa",
        database: "test"
    }
})

orm.table("test").skip(1).limit(10).where("x > 0").find().then(x => console.log(x));
orm.table("test").where("y > 0").findOne().then(x => console.log(x));

