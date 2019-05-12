import theme from '../styles/theme'

export function logout() {
  const lock = new window.Auth0Lock(window.AUTH0_CLIENT_ID, window.AUTH0_DOMAIN)
  lock.logout({
    returnTo: `${window.BASE_URL}/logout-callback`,
    client_id: window.AUTH0_CLIENT_ID
  })
}

export function login(nextUrl) {
  const lock = new window.Auth0Lock(window.AUTH0_CLIENT_ID, window.AUTH0_DOMAIN, {
    auth: {
      redirect: true,
      redirectUrl: `${window.BASE_URL}/login-callback`,
      responseType: 'code',
      params: {
        state: nextUrl || '/',
        scope: 'openid profile email'
      }
    },
    language: 'sv',
    languageDictionary: {
      title: 'SMS-maskinen',
      signUpTerms: 'I agree to the <a href="' + window.PRIVACY_URL + '" target="_new">terms of service and privacy policy</a>.'
    },
    mustAcceptTerms: true,
    closable: false,
    theme: {
      logo: '',
      primaryColor: theme.colors.green
    },
    additionalSignUpFields: [{
      name: 'given_name',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png',
      placeholder: 'förnamn'
    }, {
      name: 'family_name',
      placeholder: 'efternamn',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png'
    }, {
      name: 'cell',
      placeholder: 'telefonnummer',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png',
      validator: (cell) => ({
        valid: cell.length >= 10,
        hint: 'Måste vara ett giltigt telefonnummer'
      })
    }]
  })
  lock.show()
}

