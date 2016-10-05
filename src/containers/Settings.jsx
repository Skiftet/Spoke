import React from 'react'
import loadData from './hoc/load-data'
import loadStripe from './hoc/load-stripe'
import gql from 'graphql-tag'
import wrapMutations from './hoc/wrap-mutations'
import GSForm from '../components/forms/GSForm'
import Form from 'react-formal'
import Dialog from 'material-ui/Dialog'
import GSSubmitButton from '../components/forms/GSSubmitButton'
import FlatButton from 'material-ui/FlatButton'
import yup from 'yup'
import { formatMoney } from '../lib'
import { Card, CardText, CardActions, CardHeader } from 'material-ui/Card'
import { GraphQLRequestError } from '../network/errors'
import { StyleSheet, css } from 'aphrodite'
import Toggle from 'material-ui/Toggle'
import moment from 'moment'
const styles = StyleSheet.create({
  section: {
    margin: '10px 0'
  },
  sectionLabel: {
    opacity: 0.8,
    marginRight: 5
  },
  textingHoursSpan: {
    fontWeight: 'bold'
  },
  dialogActions: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
})

const inlineStyles = {
  dialogButton: {
    display: 'inline-block'
  }
}

const formatTextingHours = (hour) =>  moment(hour, 'H').format('h a')
class Settings extends React.Component {

  state = {
    addCreditDialogOpen: false,
    creditCardDialogOpen: false,
    formIsSubmitting: false
  }

  createStripeToken = async (formValues) => (
    new Promise((resolve, reject) => (
      Stripe.card.createToken(formValues, (status, response) => {
        if (response.error) {
          reject(new GraphQLRequestError({
            status: 400,
            message: response.error.message
          }))
        } else {
          resolve(response.id)
        }
      })
    ))
  )

  handleSubmitTextingHoursForm = async ({ textingHoursStart, textingHoursEnd }) => {
    await this.props.mutations.updateTextingHours(textingHoursStart, textingHoursEnd)
    this.handleCloseTextingHoursDialog()
  }

  handleSubmitCardForm = async (formValues) => {
    const token = await this.createStripeToken(formValues)
    await this.props.mutations.updateCard(token)
    this.handleCloseCreditCardDialog()
  }

  handleSubmitAccountCreditForm = async ({ balanceAmount }) => {
    await this.props.mutations.addAccountCredit(balanceAmount)
    this.handleCloseAddCreditDialog()
  }

  handleOpenCreditCardDialog = () => this.setState({ creditCardDialogOpen: true })

  handleCloseCreditCardDialog = () => this.setState({ creditCardDialogOpen: false })

  handleOpenAddCreditDialog = () => this.setState({ addCreditDialogOpen: true })

  handleCloseAddCreditDialog = () => this.setState({ addCreditDialogOpen: false })

  handleOpenTextingHoursDialog = () => this.setState({ textingHoursDialogOpen: true })

  handleCloseTextingHoursDialog = () => this.setState({ textingHoursDialogOpen: false })

  renderCardForm() {
    const cardFormSchema = yup.object({
      number: yup.string().required(),
      exp_year: yup.number().required(),
      exp_month: yup.number().required()
    })

    return (
        <Dialog
          open={this.state.creditCardDialogOpen}
          actions={[
          ]}
          onRequestClose={this.handleCloseCreditCardDialog}
        >
          <GSForm
            schema={cardFormSchema}
            onSubmit={this.handleSubmitCardForm}
          >
            <Form.Field
              name='number'
              data-stripe
              label='Card number'
              fullWidth
              autoFocus
            />
            <Form.Field
              name='exp_month'
              label='Expiration month'
              hintText='01'
            />
            <Form.Field
              name='exp_year'
              label='Expiration year'
              hintText='2019'
            />
            <div className={css(styles.dialogActions)}>
              <FlatButton
                label='Cancel'
                style={inlineStyles.dialogButton}
                onTouchTap={this.handleCloseCreditCardDialog}
              />
              <Form.Button
                type='submit'
                label='Change card'
                style={inlineStyles.dialogButton}
                component={GSSubmitButton}
              />
            </div>
          </GSForm>
        </Dialog>
    )
  }

  renderCreditForm() {
    const { organization } = this.props.data
    const { creditCurrency } = organization.billingDetails

    const formSchema = yup.object({
      balanceAmount: yup.number().required()
    })

    const amounts = [
      1000,
      10000,
      50000,
      100000
    ]

    const choices = amounts.map((amount) => {
      const formattedAmount = formatMoney(amount, creditCurrency)
      const { amountPerMessage } = organization.plan
      const messageCount = Math.round(amount / amountPerMessage)

      return {
        value: amount,
        label: `${formattedAmount} - approx ${messageCount} messages`
      }
    })

    return (
        <Dialog
          open={this.state.addCreditDialogOpen}
          onRequestClose={this.handleCloseAddCreditDialog}
        >
          <GSForm
            schema={formSchema}
            onSubmit={this.handleSubmitAccountCreditForm}
            defaultValue={{
              balanceAmount: '50000'
            }}
          >
            <Form.Field
              label='Credit amount'
              name='balanceAmount'
              type='select'
              fullWidth
              choices={choices}
            />
            <div className={css(styles.dialogActions)}>
              <FlatButton
                label='Cancel'
                style={inlineStyles.dialogButton}
                onTouchTap={this.handleCloseAddCreditDialog}
              />
              <Form.Button
                type='submit'
                style={inlineStyles.dialogButton}
                component={GSSubmitButton}
                label='Add credit'
              />
            </div>
          </GSForm>
        </Dialog>
    )
  }

  renderTextingHoursForm() {
    const { organization } = this.props.data
    const { textingHoursStart, textingHoursEnd } = organization

    const formSchema = yup.object({
      textingHoursStart: yup.number().required(),
      textingHoursEnd: yup.number().required()
    })

    const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
    const hourChoices = hours.map((hour) => ({
      value: hour,
      label: formatTextingHours(hour)
    }))

    const defaults = {
      textingHoursStart,
      textingHoursEnd
    }
    return (
        <Dialog
          open={this.state.textingHoursDialogOpen}
          onRequestClose={this.handleCloseTextingHoursDialog}
        >
          <GSForm
            schema={formSchema}
            onSubmit={this.handleSubmitTextingHoursForm}
            defaultValue={{ textingHoursStart, textingHoursEnd }}
          >
            <Form.Field
              label='Start time'
              name='textingHoursStart'
              type='select'
              fullWidth
              choices={hourChoices}
            />
            <Form.Field
              label='End time'
              name='textingHoursEnd'
              type='select'
              fullWidth
              choices={hourChoices}
            />

            <div className={css(styles.dialogActions)}>
              <FlatButton
                label='Cancel'
                style={inlineStyles.dialogButton}
                onTouchTap={this.handleCloseTextingHoursDialog}
              />
              <Form.Button
                type='submit'
                style={inlineStyles.dialogButton}
                component={GSSubmitButton}
                label='Save'
              />
            </div>
          </GSForm>
        </Dialog>
    )
  }

  render() {
    const { organization } = this.props.data
    const { balanceAmount, creditCurrency, creditCard } = organization.billingDetails
    return (
      <div>
        <Card>
          <CardHeader
            title='Billing'
          />
          <CardText>
            <div className={css(styles.section)}>
              <span className={css(styles.sectionLabel)}>
                Balance:
              </span>
              {formatMoney(balanceAmount, creditCurrency)}
            </div>
            <div className={css(styles.section)}>
              <span className={css(styles.sectionLabel)}>
                Card:
              </span>
              {creditCard ? `${creditCard.brand} ****${creditCard.last4}` : 'No card'}
            </div>
          </CardText>
          <CardActions>
            {creditCard ?
              <FlatButton
                label='Buy account credit'
                primary
                onTouchTap={this.handleOpenAddCreditDialog}
              /> : ''
            }
            <FlatButton
              label={creditCard ? 'Change card' : 'Add credit card'}
              primary
              onTouchTap={this.handleOpenCreditCardDialog}
            />
          </CardActions>
        </Card>

        <div>
          {this.renderCreditForm()}
          {this.renderCardForm()}
          {this.renderTextingHoursForm()}
        </div>
      </div>
    )
  }
}

Settings.propTypes = {
  data: React.PropTypes.object,
  params: React.PropTypes.object,
  mutations: React.PropTypes.object
}

const mapMutationsToProps = ({ ownProps }) => ({
  updateTextingHours: (textingHoursStart, textingHoursEnd) => ({
    mutation: gql`
      mutation updateTextingHours($textingHoursStart: Int!, $textingHoursEnd: Int!, $organizationId: String!) {
        updateTextingHours(textingHoursStart: $textingHoursStart, textingHoursEnd: $textingHoursEnd, organizationId: $organizationId) {
          id
          textingHoursEnforced
          textingHoursStart
          textingHoursEnd
        }
      }`,
    variables: {
      organizationId: ownProps.params.organizationId,
      textingHoursStart,
      textingHoursEnd
    }
  }),
  updateTextingHoursEnforcement: (textingHoursEnforced) => ({
    mutation: gql`
      mutation updateTextingHoursEnforcement($textingHoursEnforced: Boolean!, $organizationId: String!) {
        updateTextingHoursEnforcement(textingHoursEnforced: $textingHoursEnforced, organizationId: $organizationId) {
          id
          textingHoursEnforced
          textingHoursStart
          textingHoursEnd
        }
      }`,
    variables: {
      organizationId: ownProps.params.organizationId,
      textingHoursEnforced
    }
  }),
  addAccountCredit: (balanceAmount) => ({
    mutation: gql`
      mutation addAccountCredit($balanceAmount: Int!, $organizationId: String!) {
        addAccountCredit(balanceAmount: $balanceAmount, organizationId: $organizationId) {
          id
          billingDetails {
            balanceAmount
          }
        }
      }`,
    variables: {
      organizationId: ownProps.params.organizationId,
      balanceAmount
    }
  }),
  updateCard: (stripeToken) => ({
    mutation: gql`
      mutation updateCard($stripeToken: String!, $organizationId: String!) {
        updateCard(stripeToken: $stripeToken, organizationId: $organizationId) {
          id
          billingDetails {
            creditCard {
              last4
              brand
              expMonth
              expYear
            }
          }
        }
      }`,
    variables: {
      organizationId: ownProps.params.organizationId,
      stripeToken
    }
  })
})

const mapQueriesToProps = ({ ownProps }) => ({
  data: {
    query: gql`query adminGetCampaigns($organizationId: String!) {
      organization(id: $organizationId) {
        id
        name
        plan {
          id
          amountPerMessage
        }
        textingHoursEnforced
        textingHoursStart
        textingHoursEnd
        billingDetails {
          balanceAmount
          creditCurrency
          creditCard {
            expMonth
            expYear
            last4
            brand
          }
        }
      }
    }`,
    variables: {
      organizationId: ownProps.params.organizationId
    },
    forceFetch: true
  }
})

export default loadStripe(
  loadData(
    wrapMutations(Settings),
    { mapQueriesToProps, mapMutationsToProps }))