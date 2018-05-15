const MongoClient = require('mongodb').MongoClient
const url = process.env.MONGO_URI

module.exports = function (controller) {

  controller.hears('^\s*subscribe lunch', 'direct_mention', async function (bot, message) {

    try {
      let client = await MongoClient.connect(url)
      const db = client.db('test')
      let col = await db.collection('lunch')
      let subscribed = await col.find({ _id: 'lunch' }).toArray()[0]

      subscribed = subscribed ? subscribed.subscribed : []
      if (!subscribed.includes(message.user)) {
        subscribed.push(message.user)
      }
      col.updateOne({ _id: 'lunch' },
        { $set: { _id: 'lunch', subscribed: subscribed } },
        { upsert: true }
      )
      client.close()

      bot.api.reactions.add({
        name: 'thumbsup',
        channel: message.channel,
        timestamp: message.ts
      })

    } catch (err) {
      bot.reply(message, 'I experienced an error adding you :' + err)
    }

  })


  controller.hears('^\s*unsubscribe\s+lunch', 'direct_mention', async function (bot, message) {

    try {
      let client = await MongoClient.connect(url)
      const db = client.db('test')
      let col = await db.collection('lunch')
      let subscribed = await col.find({ _id: 'lunch' }).toArray()[0]

      subscribed = subscribed ? subscribed.subscribed : []
      if (subscribed.includes(message.user)) {
        subscribed.splice(subscribed.indexOf(message.user), 1)
      }
      col.updateOne({ _id: 'lunch' },
        { $set: { _id: 'lunch', subscribed: subscribed } },
        { upsert: true }
      )
      client.close()

      bot.api.reactions.add({
        name: 'thumbsup',
        channel: message.channel,
        timestamp: message.ts
      })

    } catch (err) {
      bot.reply(message, 'I experienced an error removing you :' + err)
    }
  })

  controller.hears('^\s*show\s+lunch', 'direct_mention', async function (bot, message) {
    try {
      let client = await MongoClient.connect(url)
      const db = client.db('test')
      let col = await db.collection('lunch')
      let subscribed = await col.find({ _id: 'lunch' }).toArray()[0]

      subscribed = subscribed ? subscribed.subscribed : []
      bot.reply(message, subscribed.map(user => '<@' + user + '>').join(','))
      client.close()
    } catch (err) {
      bot.reply(message, 'I experienced an error showing subscriptions :' + err)
    }
  })


  controller.hears('.*', 'direct_mention', async function (bot, message) {
    console.log('<<<<', JSON.stringify(message, null, 2))
    bot.reply(message, 'Hmm...')
  })
}
