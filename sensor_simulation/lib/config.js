const targetAccount = process.env.TARGET_ACCOUNT

const config = {

  'dev': {
    campaign: '/resources/campaigns/50buildings/campaign.json',
    iot: {
      endpoint: 'ayne38bbgvco9-ats.iot.eu-west-1.amazonaws.com',
      certId: '7027fce5f2'
    }
  },


  'stage': {
    campaign: '/resources/campaigns/50buildings/campaign.json',
    iot: {
      endpoint: 'a30wvxmios1rme-ats.iot.eu-west-1.amazonaws.com',
      certId: '8b31c37ddb'
    }
  }

}

module.exports = config[targetAccount]