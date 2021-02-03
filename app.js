/* Uncomment to measure performance run time
const { performance, PerformanceObserver } = require("perf_hooks")
const perfObserver = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(entry)
  })
})

perfObserver.observe({ entryTypes: ["measure"], buffer: true })
*/


require ('./models')
.then(async Models=> {
    // Save convinient references to our data models
    const PhotonTorpedos  = Models.PhotonTorpedos;
    const CrewMember = Models.CrewMember;
    const Cruiser = Models.Cruiser;
    const Battleship = Models.Battleship;
 
    // Will contain data instances
    var BoldlyGo, Feisty,
        Ricard, Wort,
        torpedos;
 
    function clearAll() {
        return Promise.all([
            CrewMember.clear(),
            Cruiser.clear(),
            Battleship.clear(),
            PhotonTorpedos.clear()
        ]);
    }
    async function init() {
        console.log ("Creating Boldly Go Cruiser");
        BoldlyGo = new Cruiser ("The Boldly Go");
        console.log ("Creating Feisty Battleship");
        Feisty = new Battleship ("The Feisty");

        console.log ("Creating Ricard Crew Member");
        Ricard = new CrewMember("Ricard");
        Ricard.role = "captain";
        Ricard.rank = "captain";
        
        console.log ("Adding Ricard to Boldly Go")
        BoldlyGo.addCrew (Ricard);
        BoldlyGo.captain = Ricard;

        console.log ("Creating Wort Crew Member");
        Wort = new CrewMember("Wort");
        Wort.role = "captain";
        Wort.rank = "commander";

        console.log ("Adding Wort To Feisty");
        Feisty.addCrew(Wort);
        Feisty.captain = {
            $value: Wort,
            $callback: ()=> {
                console.log ("Wort was updated as the captain of the Feisty");
            }
        }

    }
 
    function restore() {
        return Promise.all([
            Cruiser.get("The Boldly Go"),
            Battleship.get("The Feisty")
        ])
        .catch(error=> {
            console.log ("Error when restoring: " + error);
            console.log ("Collections might not exist. You might not had run firstRun() first.");
        });
    }

    function battle() {
        console.log ("\r\nStarting battle\r\n");
        BoldlyGo.raiseShields();
        Feisty.attack(BoldlyGo, 0);
    }

    async function firstRun() {
        console.log ("Clearing all...");
        await clearAll();
        init();
        Feisty.$_dbEvents.on("updated", (id, updatedFields)=> {
            console.log ("Feisty updated ");
            // console.dir (updatedFields, { depth: null });
        });
        BoldlyGo.$_dbEvents.on("updated", (id, updatedFields)=> {
            console.log ("BoldlyGo updated ");
            // console.dir (updatedFields, { depth: null });
        });

        (new PhotonTorpedos()).$_dbEvents.once("inserted", (id, torpedos)=> {
            // load the Photon Torpedos into the weapons array of Feisty
            console.log ("Loading Photon Torpedos into Feisty");
            Feisty.weapons.push(
            {
                $value: torpedos,
                // The callback will be run upon an update operation of the weapons property *of the Feisty Battleship*
                $callback: battle
            });
        });
    }

    function notFirstRun() {
        // You can also use Spaceship.map, but this is done here for the sake of example:
        restore()
        .then(ships=> {
            BoldlyGo = ships[0];
            Feisty   = ships[1];
            BoldlyGo.lowerShields();
            Feisty.attack(BoldlyGo, 0);
        });
    }

    // performance.mark("run-start")
    // Call firstRun for an example of a complete data initialization and updating
    firstRun();

    // Call notFirstRun (make sure to comment out firstRun() DO NOT RUN BOTH OF THEM!) to run actions assuming all data already exists.
    // notFirstRun();
})
.catch (err=> {
    console.log ("Error initializing models: ",err);
});
