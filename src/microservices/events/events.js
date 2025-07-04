const express = require("express");
const {Kafka} = require("kafkajs");

const Kafka_Brokers = process.env.KAFKA_BROKERS;
const Port = process.env.PORT;

main();

function main()
{
    const expressApp = express();

    const kafka = new Kafka({
        clientId: "events",
        brokers: Kafka_Brokers.split(","),
    })

    console.log("Брокеры: " + Kafka_Brokers.split(","));

    const producer = kafka.producer();
    producer.connect();

    SetProducer(expressApp, producer);

    SetConsumer(kafka);

    expressApp.listen(Port, () =>{
        console.log("Events запущен на порту:" + Port);
    });
}

function SetProducer(app, producer)
{
    app.post("/api/events/movie", async (req, res) => {
        await producer.send({
            topic: "movie",
            messages: [{value: 'Movie'}],
        });

        res.status(201).json({ status: "success" });
    });

    app.post("/api/events/user", async (req, res) => {
        await producer.send({
            topic: "user",
            messages: [{value: 'User'}],
        });
        res.status(201).json({ status: "success" });
    });

    app.post("/api/events/payment", async (req, res) => {
        await producer.send({
            topic: "payment",
            messages: [{value: 'Payment'}],
        });
        res.status(201).json({ status: "success" });
    });

    app.get("/api/events/health", (req, res) => {
        res.status(200).json({ status: true });
    });
}

function SetConsumer(kafka)
{
    const movieConsumer = kafka.consumer({ groupId: "movie-consumer" });
    const userConsumer = kafka.consumer({ groupId: "user-consumer" });
    const paymentConsumer = kafka.consumer({ groupId: "payment-consumer" });

    movieConsumer.subscribe({ topic: "movie", fromBeginning: true });
    userConsumer.subscribe({ topic: "user", fromBeginning: true });
    paymentConsumer.subscribe({ topic: "payment", fromBeginning: true });

    [movieConsumer, userConsumer, paymentConsumer].forEach(async (consumer) => {
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log({ topic, partition, message: message.value.toString() });
            },
        });
    });
}