Instructions to Run App:

(Assuming you are in the repo directory and ‘npm install’ is already done.)

1.	screen mongod 				                (‘ctrl-a’ then ‘d’ to close)
2.	mongo 					                    (ensure mongodb is running. ‘exit’ to close)
3.	mongo waitlist scripts/init.mongo.js		(initialise db)
4.	node scripts/trymongo.js			        (test mongo commands if required)
5.	npx babel src --presets @babel/react --out-dir public
6.	npm start

Then proceed to open app using browser at ‘localhost:3000’.
