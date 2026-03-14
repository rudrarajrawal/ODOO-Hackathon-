class PeopleModel {
  static getAll(db, callback) {
    db.all('SELECT * FROM people', callback);
  }

  static getById(db, id, callback) {
    db.get('SELECT * FROM people WHERE id = ?', [id], callback);
  }

  static create(db, data, callback) {
    const sql = 'INSERT INTO people (name, type, phone, email, address, rating) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(sql, [data.name, data.type, data.phone, data.email, data.address, data.rating || 0], function(err) {
      callback(err, this ? this.lastID : null);
    });
  }

  static update(db, id, data, callback) {
    const sql = 'UPDATE people SET name = ?, type = ?, phone = ?, email = ?, address = ?, rating = ? WHERE id = ?';
    db.run(sql, [data.name, data.type, data.phone, data.email, data.address, data.rating || 0, id], callback);
  }

  static delete(db, id, callback) {
    db.run('DELETE FROM people WHERE id = ?', [id], callback);
  }
}

module.exports = PeopleModel;
