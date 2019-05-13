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
      signUpTerms: 'Genom att du markerar rutan, fyller i dina uppgifter i ovannämnda fält och registrerar dig hos oss uppger du att uppgifterna tillhör dig, att du är minst 18 år gammal, att du har läst igenom och godkänner våra <a href="https://skiftet.org/anvandarvillkor" target="_blank">användarvillkor</a> och vår <a href="https://skiftet.org/personuppgiftspolicy" target="_blank">personuppgiftspolicy</a>.'
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

