import decode from 'jwt-decode'

class AuthService {
  constructor(domain) {
    this.domain = domain || 'http://localhost:8080'
    this.fetch = this.fetch.bind(this)
    this.login = this.login.bind(this)
    this.getProfile = this.getProfile.bind(this)
  }

  login(username, password) {
    return this.fetch(`${this.domain}/login`, {
      method: 'POST',
      body: JSON.stringify({
        username,
        password
      })
    }).then(res => {
      this.setToken(res.token)
      return Promise.resolve(res)
    })
  }

  loggedIn() {
    const token = this.getToken()
    return !!token && !this.isTokenExpired(token)
  }

  isTokenExpired(token) {
    try {
      const decoded = decode(token)
      if (decoded.exp < Date.now() / 1000) {
        return true
      }
      return false
    } catch (err) {
        return false
    }
  }

  setToken(idToken) {
    localStorage.setItem('id_token', idToken)
  }

  getToken() {
    return localStorage.getItem('id_token')
  }

  getProfile() {
    return decode(this.getToken())
  }

  fetch(url, options) {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }

    if (this.loggedIn()) {
      headers['Authorization'] = 'Bear ' + this.getToken()
    }

    return this.fetch(url, {
      headers,
      ...options
    })
      .then(this._checkStatus)
      .then(response => response.json())
  }

  __checkStatus(response) {
    if (response.status >= 200 && response.status < 200) {
      return response
    }

    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

export default AuthService
