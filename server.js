if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

console.log(stripeSecretKey,stripePublicKey)

const express = require("express")
const app = express()
const fs = require("fs")
const stripe = require("stripe")(stripeSecretKey)

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.json())

app.get("/store", (req,res) => {
    fs.readFile("items.json", (err,data) => {
        if (err) {
            res.status(500).json({
                message: "Internal Server Error"
            })
        } else {
            res.render("store", {
                stripePublicKey: stripePublicKey,
                items: JSON.parse(data)
            })
        }
    })
})
app.post("/purchase", (req,res) => {
    fs.readFile("items.json", (err,data) => {
        if (err) {
            res.status(500).json({
                message: "Internal Server Error"
            })
        } else {
          const itemsJson = JSON.parse(data)
          const itemsArray = itemsJson.music.concat(itemsJson.merch)
          let total = 0
          req.body.items.forEach((item) => {
              const itemJson = itemsArray.find((i) => {
                  return i.id == item.id
              })
              total = total + itemJson.price * item.quantity
          })

          stripe.charges.create({
              amount: total,
              source: req.body.stripeTokenId,
              currency: "usd"
          }).then(function(){
              console.log("Charge Successful")
              res.json({
                  message:"Successfully purchased items"
              })
          })
          .catch((err) => {
              res.status(500).json({
                  message: "Internal Server Error",
                  err
              })
          })
        }
    })
})

app.listen(3000)