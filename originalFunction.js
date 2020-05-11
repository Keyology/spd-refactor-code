async function getRecommendations(userAnimeList) {
    // const userAnimeList = ["1", "22319"];
    // const userAnimeList = ["11", "12268", "1376", "13051"];
    let userRecomendationsList = [];
    let animeSet = new Set(userAnimeList);
    let animeSet2 = new Set(userAnimeList);
    let minNumbOfAnimeRecs = 30;
    let animeScoreObj = {};
  
    const recomendations = await AnimeRecommendations.find({
      animeId: { $in: userAnimeList }
    });
    // console.log("recomendations:", recomendations[0]['animeRecommendations']);
    let animeIdMostOccur = {};
    //console.log("recomendations:", recomendations);
    if (recomendations.length == 0) return [];
    let length = recomendations[0]["animeRecommendations"].length;
    //console.log("BEFORE LENGTH", length);
    let animeListIndexes = [];
    for (let i = 0; i < userAnimeList.length; i++) {
      //console.log("***LOOP IS RUNNING****", i);
      // console.log(
      //   "****KEONI****",
      //   recomendations[i]["animeRecommendations"].length,
      //   "" // recomendations[i]["animeRecommendations"]
      // );
      if (!recomendations[i]) break;
      if (recomendations[i]["animeRecommendations"].length > length) {
        length = recomendations[i]["animeRecommendations"].length;
        //console.log("***CONDITION CLOSED****");
      }
      //console.log("ANIME PUSHED!!!");
      animeListIndexes.push(i);
      //console.log("Animer List Index", animeListIndexes);
      //console.log("Length", length);
    }
  
    let originalAnimeListIndexes = animeListIndexes;
    for (let i = 0; i < length; i++) {
      // console.log("i", i);
      let indexesToKeep = [];
      for (let j = 0; j < animeListIndexes.length; j++) {
        // console.log("j", j);
        try {
          let index = animeListIndexes[j];
          // console.log("animeListIndexes", animeListIndexes);
          // console.log("index", index);
          let animeRecId =
            recomendations[index]["animeRecommendations"][i]["animeId"];
          if (animeSet.has(animeRecId)) {
            continue;
          }
          animeScoreObj[animeRecId] =
            recomendations[index]["animeRecommendations"][i]["animeScore"];
          if (animeIdMostOccur[animeRecId]) {
            animeIdMostOccur[animeRecId] += 1;
            animeScoreObj[animeRecId] /= 2;
          } else {
            animeIdMostOccur[animeRecId] = 1;
          }
          animeSet2.add(animeRecId);
          indexesToKeep.push(index);
        } catch (err) {
          console.log("err", err);
        }
      }
      animeListIndexes = indexesToKeep;
    }
  
    let additionalAnime = [];
    if (Object.keys(animeIdMostOccur).length < minNumbOfAnimeRecs) {
      let numAnimeNeeded =
        minNumbOfAnimeRecs - Object.keys(animeIdMostOccur).length;
      //console.log("Additional", numAnimeNeeded, "animes needed");
      let numAnimeNeededPerList =
        numAnimeNeeded / originalAnimeListIndexes.length;
      for (let j = 0; j < originalAnimeListIndexes.length; j++) {
        // console.log("j", j);
        let index = originalAnimeListIndexes[j];
        let animeRecs = recomendations[index]["animeRecommendations"];
        let numOfAnimeAdded = 0;
        for (let i = 0; i < animeRecs.length; i++) {
          // console.log("j", j);
          try {
            // console.log("animeListIndexes", animeListIndexes);
            // console.log("index", index);
            let animeRecId = animeRecs[i]["animeId"];
            if (animeSet.has(animeRecId) || animeSet2.has(animeRecId)) continue;
            animeScoreObj[animeRecId] = animeRecs[i]["animeScore"];
            animeSet2.add(animeRecId);
            additionalAnime.push(animeRecId);
            numOfAnimeAdded += 1;
            if (numOfAnimeAdded >= numAnimeNeededPerList) break;
          } catch (err) {
            console.log("err2", err);
          }
        }
      }
    } else {
      console.log("There were enough anime in common");
    }
  
    keysSorted = Object.keys(animeIdMostOccur).sort(function(a, b) {
      if (animeIdMostOccur[b] == animeIdMostOccur[a]) {
        return animeScoreObj[b] - animeScoreObj[a];
      } else {
        return animeIdMostOccur[b] - animeIdMostOccur[a];
      }
    });
    additionalAnime = Object.keys(additionalAnime).sort(function(a, b) {
      return animeScoreObj[b] - animeScoreObj[a];
    });
    keysSorted = keysSorted.concat(additionalAnime);
    //console.log("******SORTED ****", keysSorted);
    userRecomendationsList = keysSorted;
    //console.log("RecomendationsList length", userRecomendationsList.length);
  
    //userRecomendationsList[0] = userRecomendationsList[0].split(",");
    // console.log("*********Recs***** ", userRecomendationsList);
    return userRecomendationsList;
  
    // console.log("ANIME MOST OCCUR", animeIdMostOccur);
  }