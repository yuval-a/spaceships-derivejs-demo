// const { performance, PerformanceObserver } = require("perf_hooks")

module.exports = new Promise( (resolve,reject)=> {
    var Models = {};
 
    const derive = require('derivejs');
 
    derive.Model
    ({
        // NOTE: ChangeStream ("collection events watcher") is NOT supported for non Replica Sets, so using a single local db instance, will not use it, and will fallback 
        // to using "manual" event callbacks (this adds an O(N) run on each bulk inserts operation). To see Change Stream in action, change dbUrl to a Replica Set.
        dbUrl: "mongodb://localhost:27017/",
        dbName: "spaceshipyard",
        debugMode: false, // <- Change this to true to see extensive DB related verbose information in real-time
        defaultMethodsLog: true,

    })
    .then(
        async Model=> {

            Models.Weapon = Model({
                _TYPE:"",
                _DAMAGE:-1,
                armed: false,
                arm: function() {
                    this.armed = true;
                },
                unarm: function() {
                    this.armed = false;
                },
                fire: function(target) {
                    if (!this.armed) {
                        console.log ("Weapon is not armed!");
                        return;
                    }
                    if (target.shields.up) {
                        if (target.shields.percent == 0) {
                            console.log ("Shields are already at 0 percent!");
                            return;
                        }
                        target.shields.percent -= this._DAMAGE;
                    }
                    else {
                        if (target.hullIntegrity == 0) {
                            console.log ("Hull integrity is already at 0!");
                            return;
                        }
                        target.hullIntegrity -= this._DAMAGE;
                    }
                },
            }, "Weapon");
            
            Models.PhotonTorpedos = Models.Weapon
            .derive({
                _TYPE_: "Photon Torpedos",
                _DAMAGE: 20
            });
            
            Models.CrewMember = Model({
                _name: "",
                rank: "",
                role: ""
            }, "CrewMember");
            
            Models.Spaceship = Model({
                _name: "",
                _TYPE: "",
                shields: {
                    up: false,
                    percent: 100
                },
                hullIntegrity: 100,
                crew: [],
                addCrew: function (crewMember) {
                    this.crew.push(crewMember);
                },
                raiseShields: function() {
                    this.shields.up = true;
                    console.log (this._name+": shields are up");
                },
                lowerShields: function() {
                    this.shields.up = false;
                    console.log (this._name+": shields are down");
                },
                captain: "",
                
                // Listen to changes on this properties
                $Listen: [ "shields.percent", "hullIntegrity" ],
                changed(prop, value) {
                    // performance.mark("run-end");
                    // performance.measure("run-time", "run-start", "run-end")
                    console.log (this._name + ": " + prop + " CHANGED TO " + value);
                    if (prop == "shields.percent" && value == 0) console.log (this._name + ": SHIELDS AT 0 PERCENT!");
                    if (prop == "hullIntegrity"   && value == 0) console.log (this._name + ": HULL INTEGRITY IS AT 0! SHIP IS DESTROYED!");
                }
            }, "Spaceship");
            
            Models.Cruiser = Models.Spaceship
            .derive({
                _TYPE_: "Cruiser"
            });
 
            Models.Battleship = Models.Spaceship
            .derive({
                _TYPE_: "Battleship",
                weapons: [],
                attack: function(target, weaponIndex) {
                    Models.Weapon.get(this.weapons[weaponIndex])
                    .then(w=> {
                        console.log (`${this._name} is attacking ${target._name}!`);
                        if (!w.armed) w.arm();
                        w.fire(target);
                    });
                }
            });
 
            resolve (Models);
        }
    )
});
