const MongoClient = require('mongodb').MongoClient
const url = process.env.MONGO_URI

module.exports = function (controller) {

  controller.hears('.*', 'ambient', async function (bot, message) {
    let moment = require('moment')
    let today = moment().startOf('day').format('DD MM YYYY')
    let lastMonth = moment().endOf('month').subtract(1, 'months').format('MM YYYY')

    console.log('>>>>>>>>>>>>>>>>>>', moment().format('HH:mm DD MM YYYY'))

    try {
      let client = await MongoClient.connect(url)
      const db = client.db(message.team)
      let col = await db.collection('presence')
      let monitor = (await col.find({ _id: 'group' }).toArray())[0].monitor

      if (message.channel !== monitor) return

      console.log('<<<<<<<<<<<<<<<', await loadAttendance(lastMonth))

      let regex = /.*\n.*\n.*\n.*/g
      if (!message.text.match(regex)) {
        bot.whisper(message, "Looks like your report doesn't contains four things that you have done previous day, could you add more?")
      }

      let presence = (await col.find({ _id: today }).toArray())[0]
      presence = presence ? presence.presence : []
      if (!presence.includes(message.user)) {
        presence.push(message.user)
      }
      col.updateOne({ _id: today },
        { $set: { _id: today, presence: presence } },
        { upsert: true }
      )
      client.close()

      bot.api.reactions.add({
        name: 'heavy_check_mark',
        channel: message.channel,
        timestamp: message.ts
      })

    } catch (err) {
      bot.api.reactions.add({
        name: 'x',
        channel: message.channel,
        timestamp: message.ts
      })

      console.log(err)
    }
  })

  controller.hears('^\s*monitor presence', 'direct_mention', async function (bot, message) {
    try {
      let client = await MongoClient.connect(url)
      const db = client.db(message.team)
      let col = await db.collection('presence')

      col.updateOne({ _id: 'group' },
        { $set: { _id: 'group', monitor: message.channel } },
        { upsert: true }
      )
      client.close()

      bot.api.reactions.add({
        name: 'thumbsup',
        channel: message.channel,
        timestamp: message.ts
      })

    } catch (err) {

      bot.api.reactions.add({
        name: 'x',
        channel: message.channel,
        timestamp: message.ts
      })

      bot.replyInThread(message, 'I experienced an error saving configuration :' + err)
    }
  })

  controller.hears('^\s*presence', 'direct_message,direct_mention', async function (bot, message) {
    try {
      let client = await MongoClient.connect(url)
      const db = client.db(message.team)
      let col = await db.collection('presence')
      let presence = (await col.find({}).toArray()).filter(obj => obj._id !== 'group')
      client.close()
      let attendence = presence
        .map(obj =>
          obj._id + ':\n' + obj.presence
            .map(user => '<@' + user + '>'))
        .join('\n')

      bot.reply(message, "presence:\n" + attendence)
    } catch (err) {
      bot.api.reactions.add({
        name: 'x',
        channel: message.channel,
        timestamp: message.ts
      })

      console.log(err)
    }
  })
}

async function loadAttendance(month) {
  let client = await MongoClient.connect(url)
  const db = client.db(message.team)
  let attendance = await db.collection('attendance')
  let attended = (await attendance.find({ _id: month }).toArray())[0]
  return attended
}