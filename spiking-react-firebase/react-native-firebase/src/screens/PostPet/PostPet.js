import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Button,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import uuid from "react-native-uuid";
import {
  collection,
  addDoc,
  getDocs,
  QuerySnapshot,
  getFirestore,
} from "@firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { firebase } from "../../firebase/config";
import "firebase/firestore";
import "firebase/compat/firestore";
import "@firebase/firestore";
import "@firebase/storage";
import "@firebase/storage-compat";
import { app } from "../../firebase/config";
import Footer from "../Footer/Footer";
import CalendarPopUp from "../Calendar.js/Calendar";
import { AutoComp } from "../../components/AutoComp";
import { ActivityIndicator } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { appKey } from "../../components/key";
import { useNavigation } from "@react-navigation/native";

const db = getFirestore(app);

export default function PostPet({ extraData }) {
  const navigation = useNavigation();

  const [pet_name, setPet_name] = useState("");
  const [your_name, setYour_name] = useState("");
  const [email, setEmail] = useState("");
  const [home_address, setHome_address] = useState("");
  const [chipId, setChipId] = useState("");
  const [pet_type, setPet_type] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [isClicked, setIsClicked] = useState(false);
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState({});
  const [town, setTown] = useState("");
  const [postcode, setPostcode] = useState("");
  const [imageIsPicked, setImageIsPicked] = useState(false);

  const dayjs = require("dayjs");
  const date = dayjs(selectedStartDate).format("MMMM DD YYYY");

  const uploadImage = () => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        const blob = xhr.response;
        const photoFileId = uuid.v4();
        const ref = firebase.storage().ref().child(`Pictures/${photoFileId}`);
        const snapshot = ref.put(blob);
  
        snapshot.on(
          firebase.storage.TaskEvent.STATE_CHANGED,
          () => {
            // Uploading state
            setUploading(true);
          },
          (error) => {
            // Error state
            setUploading(false);
            console.log(error);
            blob.close();
            reject(new TypeError("Network request failed"));
          },
          () => {
            // Success state
            snapshot.snapshot.ref.getDownloadURL().then((url) => {
              setUploading(false);
              console.log("Download URL: ", url);
              alert("image successfully uploaded");
              setImage(url);
              blob.close();
              resolve(url);
            });
          }
        );
      };
      xhr.onerror = function () {
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", image, true);
      xhr.send(null);
    });
  };
  

  const pickImage = () => {
    ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })
    .then((result) => {
      if (!result.canceled) {
        setImageIsPicked(true);
        setImage(result.assets[0].uri);
      }
    })
    .catch((error) => {
      console.log(error);
    });
  };
  

  const handleSubmit = async () => {
    if (
      pet_name.length === 0 ||
      email.length === 0 ||
      location.length === 0 ||
      pet_type.length === 0 ||
      your_name.length === 0 ||
      uploading === true ||
      imageIsPicked === false
    ) {
      alert("Please complete all required field, and upload an image");
      return;
    }

    try {
      const submitRef = await addDoc(collection(db, "lost_pets"), {
        description: description,
        email: email,
        lastSeenDate: selectedStartDate.toString(),
        chipId: chipId,
        location: location,
        pet_name: pet_name,
        pet_type: pet_type,
        picture: image,
        your_name: your_name,
        userID: extraData.id,
        userProfileEmail: extraData.email,
        userProfileName: extraData.fullName,
        postcode,
        coordinates,
        town,
      });
      setIsClicked(false);
      alert("Post successful!");
      navigation.navigate("Home");
    } catch (e) {
      console.error(e);
    }
  };

  const petTypes = ["Cat", "Dog", "Rabbit", "Bird", "other"];

  return (
    <>
      <ScrollView
        keyboardShouldPersistTaps={"handled"}
        horizontal={false}
        style={styles.container}
      >
        <Text style={styles.title}>Report a lost pet</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter pet name (required)"
          value={pet_name}
          onChangeText={(e) => {
            setPet_name(e);
          }} // req
        />
        <TextInput
          style={styles.input}
          placeholder="Enter your name (required)"
          value={your_name}
          onChangeText={(e) => {
            setYour_name(e);
          }}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter email (required)"
          value={email}
          onChangeText={(e) => {
            setEmail(e);
          }}
        />
        {/* <TextInput
          style={styles.input}
          placeholder="Enter home address"
          value={home_address}
          onChangeText={(e) => {
            setHome_address(e);
          }}
        /> */}
        <ScrollView
          keyboardShouldPersistTaps={"handled"}
          horizontal={true}
          style={styles.inputAuto}
        >
          <AutoComp
            setLocation={setLocation}
            setCoordinates={setCoordinates}
            setTown={setTown}
            setPostcode={setPostcode}
          />
        </ScrollView>
      
        <SelectDropdown
        defaultButtonText={'Select Pet Type'}
          style={styles.selectinput}
          data={petTypes}
          buttonStyle={styles.selectinput}
        
          onSelect={(selectedItem, index) => {
            setPet_type(selectedItem);
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem;
          }}
          rowTextForSelection={(item, index) => {
            return item;
          }}
        />
        <TextInput
          style={styles.input}
          placeholder="More details of lost pet (required)"
          value={description}
          onChangeText={(e) => {
            setDescription(e);
          }}
        /> 
         <TextInput
          style={styles.input}
          placeholder="Enter chip id (optional)"
          value={chipId}
          onChangeText={(e) => {
            setChipId(e);
          }}
        />
        <Text  style={styles.inputDate}>
          {date.toString() === "Invalid Date"
            ? "Please pick a date"
            : date.toString()}
        </Text>
        {/* {console.log(date.toString())} */}
        <TouchableOpacity
          style={styles.calendarContainer}
          onPress={() => {
            setIsClicked(true);
          }}
        >
          {isClicked ? (
            <CalendarPopUp setSelectedStartDate={setSelectedStartDate} setIsClicked={setIsClicked}/>
          ) : (
            ""
          )}
          <Text style={styles.buttonText}>Pick date lost</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonContainer} onPress={pickImage}>
          <Text style={styles.buttonText}>Choose pic</Text>
        </TouchableOpacity>

        {!uploading ? (
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={uploadImage}
          >
            <Text style={styles.buttonText}>Upload Image</Text>
          </TouchableOpacity>
        ) : (
          <ActivityIndicator size={"small"} color="black" />
        )}

        <TouchableOpacity
          style={styles.buttonContainerBottom}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
      <Footer />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5cc8d7",
  },
  title: {
    fontSize: 25,
    color: "#000",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignSelf: "center",
    fontWeight: "bold",
  },
  input: {
    height: 48,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "white",
    marginTop: 6,
    marginBottom: 6,
    marginLeft: 30,
    marginRight: 30,
    paddingLeft: 16,
    width: 350
  },
  selectinput: {
    height: 48,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "white",
    marginTop: 6,
    marginBottom: 6,
    marginLeft: 30,
    marginRight: 30,
    paddingLeft: 16,
    width: 350,
   
  },
  inputAuto: {
     height: 48,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "white",
    marginTop: 6,
    marginBottom: 6,
    marginLeft: 30,
    marginRight: 30,
    paddingTop: 2,
    paddingLeft: 8,
    width: 350,
  },
  inputDate:{
    height: 48,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "white",
    marginTop: 6,
    marginBottom: 6,
    marginLeft: 30,
    marginRight: 30,
    paddingLeft: 16,
    paddingTop: 15,
    width: 350,
    fontSize:14,
    color:"silver"
   
  },
  buttonContainer: {
    marginRight: 7,
    marginLeft: 7,
    marginTop: 10,
    marginBottom: 7,
    elevation: 8,
    backgroundColor: "#788eec",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "black",
    margin: 20,
    shadowRadius: 1.5,
    shadowOpacity: 0.5,
    shadowColor: "black",
  },
  buttonContainerBottom: {
    marginRight: 7,
    marginLeft: 7,
    marginTop: 10,
    marginBottom: 30,
    elevation: 8,
    backgroundColor: "#788eec",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "black",
    margin: 20,
    shadowRadius: 1.5,
    shadowOpacity: 0.5,
    shadowColor: "black",
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase",
  },
  
  calendarContainer: {
    marginRight: 7,
    marginLeft: 7,
    marginTop: 10,
    marginBottom: 7,
    elevation: 8,
    backgroundColor: "#788eec",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "black",
    shadowRadius: 1.5,
    shadowOpacity: 0.5,
    shadowColor: "black",
  },
});
