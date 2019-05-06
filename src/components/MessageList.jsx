import PropTypes from 'prop-types'
import React from 'react'
import { List, ListItem } from 'material-ui/List'
import moment from 'moment'
import ProhibitedIcon from 'material-ui/svg-icons/av/not-interested'
import Divider from 'material-ui/Divider'
import { red300 } from 'material-ui/styles/colors'

const styles = {
  optOut: {
    fontSize: '13px',
    fontStyle: 'italic'
  },
  sent: {
    fontSize: '13px',
    textAlign: 'right',
    marginLeft: '24px',
    marginRight: '10px',
    backgroundColor: '#1c9bff',
    color: '#fff',
    float: 'right'
  },
  received: {
    fontSize: '13px',
    marginLeft: '10px',
    marginRight: '24px',
    backgroundColor: '#eee',
    float: 'left'
  }
}

const MessageList = function MessageList(props) {
  const { contact } = props
  const { optOut, messages } = contact

  const optOutItem = optOut ? (
    <div>
      <Divider />
      <ListItem
        style={styles.optOut}
        leftIcon={<ProhibitedIcon style={{ fill: red300 }} />}
        disabled
        primaryText={`${contact.firstName} opted out of texts`}
        secondaryText={moment(optOut.createdAt).fromNow()}
      />
    </div>
  ) : ''

  return (
    <List>
      {messages.map(message => (
        <div style={{ clear: 'both' }}>
          <ListItem
            disabled
            style={{
              borderRadius: '10px',
              display: 'inline-block',
              marginBottom: '5px',
              ...(message.isFromContact ? styles.received : styles.sent)
            }}
            key={message.id}
            primaryText={message.text}
            secondaryText={moment(message.createdAt).fromNow()}
          />
        </div>
      ))}
      {optOutItem}
    </List>
  )
}

MessageList.propTypes = {
  contact: PropTypes.object
}

export default MessageList
