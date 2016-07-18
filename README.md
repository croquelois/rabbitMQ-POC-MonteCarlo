# Using RabbitMQ to compute a MonteCarlo with Black-Scholes

It's just a proof of concept of using RabbitMQ with an aggregator, there is 3 instance here:
- mc_starter: insert one job by montecarlo path
- mc_worker: get a job from the queue, and compute the payoff. When all related montecarlo path are done, it send an aggregation task to the queue
- mc_aggregation: aggregate the value (do the average)

just a POC, it's super inefficient for the job of computing the value of a vanilla option
