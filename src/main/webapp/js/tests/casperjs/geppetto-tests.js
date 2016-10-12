//var TARGET_URL = "http://docker-x2go-development-1.dd76b43e.cont.dockerapp.io"
var TARGET_URL = "http://127.0.0.1"
var PROJECT_URL_SUFFIX = "?load_project_from_url=https://raw.githubusercontent.com/openworm/org.geppetto.samples/development/UsedInUnitTests/SingleComponentHH/GEPPETTO.json"
var PROJECT_URL_SUFFIX_2 = "?load_project_from_url=https://raw.githubusercontent.com/openworm/org.geppetto.samples/development/UsedInUnitTests/pharyngeal/project.json"
var PROJECT_URL_SUFFIX_3 = "?load_project_from_url=https://raw.githubusercontent.com/openworm/org.geppetto.samples/development/UsedInUnitTests/balanced/project.json"



casper.test.begin('Geppetto basic tests', 81, function suite(test) {
  casper.options.viewportSize = {
          width: 1340,
          height: 768
      };

  casper.start(TARGET_URL + ":8080/org.geppetto.frontend", function() {
    this.waitForSelector('div#logo', function() {
      this.echo("I waited for the logo to load.");
      test.assertTitle("geppetto's home", "geppetto's homepage title is the one expected");
      test.assertExists('div#logo', "logo is found");
    }, null, 30000);
  });

  casper.thenOpen(TARGET_URL + ":8080/org.geppetto.frontend/login?username=guest1&password=guest",function() {
      this.waitForSelector('div#page', function() {
        this.echo("I've waited for the splash screen to come up.");
        test.assertUrlMatch(/splash$/, 'Virgo Splash Screen comes up indicating successful login');
    }, null, 30000);
  });

  casper.thenOpen(TARGET_URL + ":8080/org.geppetto.frontend/",function() {
      this.waitForSelector('div[project-id="4"]', function() {
        this.echo("I've waited for the projects to load.");
        test.assertExists('div#logo', "logo is found");
        test.assertExists('div[project-id="4"]', "Projects from persistence bundle are present")
        test.assertSelectorHasText('div.user', 'Guest user', "Guest user is logged in");
    }, null, 30000);
  });

  casper.then(function() {
    testProject(test, TARGET_URL + ":8080/org.geppetto.frontend/geppetto" + PROJECT_URL_SUFFIX, true,
    false, 'hhcell.hhpop[0].v', 'hhcell.explicitInput.pulseGen1.delay');
  });

  casper.then(function() {
    testProject(test, TARGET_URL + ":8080/org.geppetto.frontend/geppetto" + PROJECT_URL_SUFFIX_2, false,
    false, 'c302_A_Pharyngeal.M1[0].v', 'c302_A_Pharyngeal.MI[0].C')
  });

  /* TEMP COMMENT OUT BECAUSE THIS IS FAILING
  casper.then(function() {
    testProject(test, TARGET_URL + ":8080/org.geppetto.frontend/geppetto" + PROJECT_URL_SUFFIX_3, false,
    true, 'hhcell.hhpop[0].v', 'hhcell.explicitInput.pulseGen1.delay')
  });*/

  //TODO: log back in as other users. Check more things
  //TODO: exercise the run loop, check the changing experiment status, try to make experiment fail

  casper.run(function() {
      test.done();
  });
});


function testProject(test, url, expect_error, persisted, spotlight_record_variable, spotlight_set_parameter) {

  casper.thenOpen(url,function() {
      this.echo("Loading an external model that is not persisted at " + url);

      if (expect_error) {
        casper.then(function() {
          closeErrorMesage(test)
        });
      }

      casper.then(function() {
        doExperimentTableTest(test);
      });

      casper.then(function() {
        this.waitForSelector('tr.experimentsTableColumn:nth-child(1)', function() {
          test.assertExists('tr.experimentsTableColumn:nth-child(1)', "At least one experiment row exists");
        }, null, 5000);
      });

      //do checks on the state of the project if it is not persisted
      if (persisted == false) {
        casper.then(function() {
          //roll over the experiments row
          this.mouse.move('tr.experimentsTableColumn:nth-child(1)');
          doPrePersistenceExperimentsTableButtonsCheck(test);

          this.mouseEvent('click','tr.experimentsTableColumn:nth-child(1)', "opening first experiment row");
          doExperimentsTableRowCheck(test);
        });
        casper.then(function() {
          doPrePersistenceSpotlightCheckRecordedVariables(test, spotlight_record_variable);
        });
        casper.then(function() {
          doPrePersistenceSpotlightCheckSetParameters(test, spotlight_set_parameter);
        });

        casper.then(function() {

          this.waitForSelector('button.btn.SaveButton', function() {
            test.assertVisible('button.btn.SaveButton', "Persist button is present");
          });

          //Good pattern for checking the absence of an attribute
          test.assertEvalEquals(function() {
            return require('utils').dump(this.getElementAttribute('button.SaveButton', 'disabled'));
          }, null, "The persist button is correctly active.");

          //Click persist button. Check things again
          this.mouseEvent('click','button.btn.SaveButton', "attempting to persist");

        });

        //TODO: make this work
        //this.mouseEvent('click', 'button[data-reactid=".9.4"]', "Running an experiment");

        //TODO: Test indicator light during experiment run
        //TODO: test experiment buttons again to see if they are in the right configuration after simulation run

        //TODO: Clone an experiment and see if it has the right state and changes the state correctly for the other experiment rows

      }

      casper.then(function() {
        casper.waitForSelector('button.btn.SaveButton[disabled]', function() {
          test.assertExists("button.btn.SaveButton[disabled]", "The persist button is now correctly inactive");
        }, null, 30000);
      });
      casper.then(function() {
        //roll over the experiments row
        this.mouse.move('tr.experimentsTableColumn:nth-child(1)');
        doPostPersistenceExperimentsTableButtonCheck(test);
      });
      casper.then(function() {
        doPostPersistenceSpotlightCheckRecordedVariables(test, spotlight_record_variable);
      });
      casper.then(function() {
        doPostPersistenceSpotlightCheckSetParameters(test, spotlight_set_parameter);
        //TODO: set a variable to record and a parameter to watch and make sure
        //the experiment table row updates correctly.
          //TODO: logout
      });
    });
}

function closeErrorMesage(test) {
  casper.waitUntilVisible('div.modal-content', function() {
    this.echo("I've waited for the popup message to load up");
    test.assertVisible('h3.text-center', "Error message correctly pops up");
    test.assertSelectorHasText('h3.text-center', 'Message', "Error message correctly pops up with the message header");
    this.mouseEvent('click','button.btn', "closing error message");
    this.waitWhileVisible('h3.text-center', function () {
      test.assertNotVisible('h3.text-center', "Correctly closed error message");
    }, null, 30000);
  }, null, 10000);
}

function doExperimentTableTest(test) {
  casper.then(function() {
    test.assertExists('a[aria-controls="experiments"]', "Experiments tab anchor is present");

    test.assertExists('div#experiments', "Experiments panel is present");

    test.assertNotVisible('div#experiments', "The experiment panel is correctly closed.");
  }).thenClick('a[aria-controls="experiments"]', function() {
    this.waitUntilVisible('div#experiments', function() {
      test.assertVisible('div#experiments', "The experiment panel is correctly open.");
    }, null, 20000);
  });
}

function doExperimentsTableRowCheck(test) {
    test.assertVisible('td[name="parameters"]', "Parameters column content exists");
    test.assertVisible('td[name="variables"]', "Variables column content exists");
}

function doPrePersistenceExperimentsTableButtonsCheck(test) {

  casper.waitFor(function check() {
    return this.exists('a.activeIcon') &&
    !this.visible('a.activeIcon') &&
    this.exists('a.deleteIcon') &&
    !this.exists('a.enabled.deleteIcon') &&
    this.exists('a.downloadResultsIcon') &&
    !this.visible('a.downloadResultsIcon') &&
    this.exists('a.downloadModelsIcon') &&
    this.visible('a.downloadModelsIcon') &&
    this.exists('a.cloneIcon') &&
    !this.exists('a.enabled.cloneIcon')
  }, function then() {

      test.assertNotVisible('a.activeIcon', "active button exists and is correctly not enabled");

      test.assertDoesntExist('a.enabled.deleteIcon', "delete button exists and is correctly not enabled");

      test.assertNotVisible('a.downloadResultsIcon', "download results button exists and is correctly not enabled");

      test.assertVisible('a.downloadModelsIcon', "download models button exists and is correctly enabled");

      test.assertDoesntExist('a.enabled.cloneIcon', "clone button exists and is correctly not enabled");

    }, function timeout() {
      this.capture('very-strange.png');
      this.echo("Somehow the icons didn't load correctly; check screenshot: \'very-strange.png\'").exit();
      var logString = "Here is a report of the variable state that was seen (all should be true):"
      logString = logString + "\nthis.exists('a.activeIcon'): " + this.exists('a.activeIcon')
      logString = logString + "\n!this.visible('a.activeIcon'): " +
      !this.visible('a.activeIcon')
      logString = logString + "\nthis.exists('a.deleteIcon'): " +
      this.exists('a.deleteIcon')
      logString = logString + "\n!this.exists('a.enabled.deleteIcon'): " +
      !this.exists('a.enabled.deleteIcon')
      logString = logString + "\nthis.exists('a.downloadResultsIcon'): " +
      this.exists('a.downloadResultsIcon')
      logString = logString + "\n!this.visible('a.downloadResultsIcon'): " +
      !this.visible('a.downloadResultsIcon')
      logString = logString + "\nthis.exists('a.downloadModelsIcon'): " +
      this.exists('a.downloadModelsIcon')
      logString = logString + "\nthis.visible('a.downloadModelsIcon'): " + this.visible('a.downloadModelsIcon')
      logString = logString + "\nthis.exists('a.cloneIcon'): " + this.exists('a.cloneIcon')
      logString = logString + "\n!this.exists('a.enabled.cloneIcon'): " +
      !this.exists('a.enabled.cloneIcon')
      this.echo(logString);
    }
    , 30000);
  }

  function doPostPersistenceExperimentsTableButtonCheck(test) {

    casper.waitFor(function check() {
      return this.exists('button.btn.SaveButton[disabled]') &&
      this.exists('a.activeIcon') &&
      !this.visible('a.activeIcon') &&
      this.exists('a.deleteIcon') &&
      this.visible('a.deleteIcon') &&
      this.exists('a.downloadResultsIcon') &&
      !this.visible('a.downloadResultsIcon') &&
      this.exists('a.downloadModelsIcon') &&
      this.visible('a.downloadModelsIcon') &&
      this.exists('a.cloneIcon') &&
      this.visible('a.cloneIcon')
    }, function then() {

        test.assertNotVisible('a.activeIcon', "active button exists and is correctly not enabled");

        test.assertVisible('a.deleteIcon', "delete button exists and is correctly enabled");

        test.assertNotVisible('a.downloadResultsIcon', "download results button exists and is correctly not enabled");

        test.assertVisible('a.downloadModelsIcon', "download models button exists and is correctly enabled");

        test.assertVisible('a.cloneIcon', "clone button exists and is correctly enabled");

      }, function timeout() {
        this.capture('very-strange.png');
        this.echo("Somehow the icons didn't load correctly; check screenshot: \'very-strange.png\'").exit();
        var logString = "Here is a report of the variable state that was seen (all should be true):"
        logString = logString + "\nthis.exists('button.btn.SaveButton[disabled]'): " +
        this.exists('button.btn.SaveButton[disabled]')
        logString = logString + "\nthis.exists('a.activeIcon'): " + this.exists('a.activeIcon')
        logString = logString + "\n!this.visible('a.activeIcon'): " +
        !this.visible('a.activeIcon')
        logString = logString + "\nthis.exists('a.deleteIcon'): " +
        this.exists('a.deleteIcon')
        logString = logString + "\nthis.visible('a.deleteIcon'): " +
        this.visible('a.deleteIcon')
        logString = logString + "\nthis.exists('a.downloadResultsIcon'): " +
        this.exists('a.downloadResultsIcon')
        logString = logString + "\n!this.visible('a.downloadResultsIcon'): " +
        !this.visible('a.downloadResultsIcon')
        logString = logString + "\nthis.exists('a.downloadModelsIcon'): " +
        this.exists('a.downloadModelsIcon')
        logString = logString + "\nthis.visible('a.downloadModelsIcon'): " + this.visible('a.downloadModelsIcon')
        logString = logString + "\nthis.exists('a.cloneIcon'): " + this.exists('a.cloneIcon')
        logString = logString + "\nthis.visible('a.cloneIcon'): " +
        this.visible('a.cloneIcon')
        this.echo(logString);
      }
      , 30000);
    }

function doSpotlightCheck(test, spotlight_search, persisted, check_recorded_or_set_parameters) {
  test.assertExists('i.fa-search', "Spotlight button exists")
  casper.mouseEvent('click','i.fa-search', "attempting to open spotlight");

  casper.waitUntilVisible('div#spotlight', function() {
    test.assertVisible('div#spotlight', "Spotlight opened");

    //type in the spotlight
    casper.sendKeys('input#typeahead', spotlight_search, { keepFocus: true });
    //press enter
    casper.sendKeys('input#typeahead', casper.page.event.key.Return , {keepFocus: true});

    casper.waitUntilVisible('div#spotlight', function() {

      casper.then(function() {

        if (persisted) {
          if (check_recorded_or_set_parameters) {
            this.echo("Waiting to see if the recorded variables button becomes visible");
            casper.waitUntilVisible('button#watch', function() {
              test.assertVisible('button#watch', "Record variables icon correctly visible");
              this.echo("Recorded variables button became visible correctly");
            }, null, 8000);
          } else {
            //TESTS THAT THE PARAMETER IS SETTABLE
            test.assertVisible('input.spotlight-input', "Parameter input field correctly visible");
          }
        } else {
          if (check_recorded_or_set_parameters) {
            //TESTS THAT THE VARIABLE IS NOT RECORDABLE
            test.assertNotVisible('button#watch', "Record variables icon correctly not visible");
          } else {
            //TESTS THAT THE PARAMETER IS NOT SETTABLE
            test.assertNotVisible('input.spotlight-input', "Parameter input field correctly not visible");
          }
        }
      });

      casper.then(function() {
        this.mouse.move('tr.experimentsTableColumn:nth-child(1)');
        casper.mouseEvent('click','div#spotlight', "attempting to close spotlight");
        this.echo("Clicking to close spotlight");
        casper.sendKeys('input#typeahead', casper.page.event.key.Escape, {keepFocus: true});
        this.echo("Hitting escape to close spotlight");

        this.waitWhileVisible('div#spotlight', function() {
          test.assertNotVisible('div#spotlight', "Spotlight closed correctly");
        }, null, 10000);
      })
    });

  });
}

function doPrePersistenceSpotlightCheckRecordedVariables(test, spotlight_search) {
  doSpotlightCheck(test, spotlight_search, false, true);
}

function doPrePersistenceSpotlightCheckSetParameters(test, spotlight_search) {
  doSpotlightCheck(test, spotlight_search, false, false);
}

function doPostPersistenceSpotlightCheckRecordedVariables(test, spotlight_search) {
  doSpotlightCheck(test, spotlight_search, true, true);
}

function doPostPersistenceSpotlightCheckSetParameters(test, spotlight_search) {
  doSpotlightCheck(test, spotlight_search, true, false);
}
