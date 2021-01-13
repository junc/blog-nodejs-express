
class User
{
  constructor(user) {
    for (let key in user) {
      this[ key ] = user[ key ]
    }

    if (!this.options) {
      this.options = {}
    }
  }

  /**
   * Is user admin.
   * 
   * @return {Bolean}
   */
  is_admin() {
    return this.options && this.options.is_admin
  }
}

module.exports = User
