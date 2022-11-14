import {Sequelize} from 'sequelize'

const db = new Sequelize('app', '', '',{
  storage:"./food.sqlite",
  dialect:"sqlite",
  logging:false
})