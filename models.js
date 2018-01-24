module.exports = new Promise( (resolve,reject)=> {
    var Models = {};
 
    const derive = require('derivejs');
 
    derive.Model
    ({
        dbUrl: "mongodb://localhost:27017/",
        dbName: "spaceshipyard",
        debugMode: false
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
                        target.shields.percent -= this._DAMAGE;
                    }
                    else {
                        target.integrityHull -= this._DAMAGE;
                    }
                },
                _created: function() {
                    if (this.$ready) this.$ready.call(this);
                },
                // For a weapon-ready callback
                $ready: null
            }, "Weapon");
            
            Models.PhotonTorpedos = class extends Models.Weapon
            .derive({
                _TYPE_: "Photon Torpedos",
                _DAMAGE: 20
            }) {
                constructor(readyCallback) {
                    super ();
                    this.$ready = readyCallback;
                }
            };
            
            Models.CrewMember = Model({
                _name: "",
                rank: "",
                role: ""
            }, "CrewMember");
            
            Models.Spaceship = Model({
                _name: "",
                TYPE: "",
                shields: {
                    up: false,
                    percent: 100
                },
                integrityHull: 100,
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
                $Listen: [ "shields.percent", "integrityHull" ]
            }, "Spaceship");
            
            Models.Cruiser = Models.Spaceship
            .derive({
                TYPE_: "Cruiser"
            });
 
            Models.Battleship = Models.Spaceship
            .derive({
                TYPE_: "Battleship",
                weapons: [],
                attack: function(target, weaponIndex) {
                    Models.Weapon.get(this.weapons[weaponIndex])
                    .then(w=> {
                        if (!w.armed) w.arm();
                        w.fire(target);
                    });
                }
            });
 
            resolve (Models);
        }
    )
});
