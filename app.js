require ("./Models")
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
            Battleship.clear()
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
        Feisty.captain = Wort;
 
    }
 
    function restore() {
        return Promise.all([
            Cruiser.get("The Boldly Go"),
            Battleship.get("The Feisty")
        ]);
    }
 
    function battle() {
        console.log ("Starting battle");
        BoldlyGo.raiseShields();
        Feisty.attack(BoldlyGo, 0);
    }
 
    console.log ("Clearing all...");
    await clearAll();
    init();
    console.log ("Adding Photon Torpedos to Feisty");
    // Wait until PhotonTorpedos are added to Feisty, then run a battle
    Feisty.weapons.push( new PhotonTorpedos(function() {
        console.log ("Photon Torpedos ready")
        battle();
    }) );

    /* 
    // You can also use Spaceship.map, but this is done here for the sake of example:
    restore()
    .then(ships=> {
        BoldlyGo = ships[0];
        Feisty   = ships[1];
        BoldlyGo.lowerShields();
        Feisty.attack(BoldlyGo, 0);
    });
    */
    
})
.catch (err=> {
    console.log ("Error initializing models: ",err);
});
