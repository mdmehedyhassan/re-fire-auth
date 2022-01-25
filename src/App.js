import React, { useState } from 'react';
import './App.css'
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase.config';
import { createUserWithEmailAndPassword, FacebookAuthProvider, getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";

initializeApp(firebaseConfig);

const App = () => {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: ''
  })

  const handleSignIn = () => {
    console.log("Google sign in")
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result)
        const { displayName, email, photoURL } = result.user;
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signedInUser)
        // // This gives you a Google Access Token. You can use it to access the Google API.
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
        // // The signed-in user info.
        // const user = result.user;
        // // ...
      }).catch((error) => {
        console.log(error);
        // // Handle Errors here.
        // const errorCode = error.code;
        // const errorMessage = error.message;
        // // The email of the user's account used.
        // const email = error.email;
        // // The AuthCredential type that was used.
        // const credential = GoogleAuthProvider.credentialFromError(error);
        // // ...
      });
  }
  const handleSignOut = () => {
    console.log('Google Sign Out')
    const auth = getAuth();
    signOut(auth).then(() => {
      const signedInUser = {
        isSignedIn: false,
        newUser: false,
        name: '',
        email: '',
        photo: '',
        error: '',
        success: false
      }
      setUser(signedInUser)
    }).catch((error) => {
      // An error happened. 
    });
  }

  const handleBlur = (e) => {
    let isFieldValid;
    if (e.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
    }
    if (e.target.name === 'password') {
      const isPasswordValid = e.target.value.length >= 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value)
      isFieldValid = isPasswordValid && passwordHasNumber;
    }
    if (e.target.name === 'name') {
      isFieldValid = true;
    }
    if (isFieldValid) {
      // [...cart, newItem]
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo)
    }
  }
  const handleSubmit = (e) => {
    // console.log('email: ', user.email, 'password: ', user.password)
    if (newUser && user.email && user.password) {
      const auth = getAuth();
      createUserWithEmailAndPassword(auth, user.email, user.password)
        .then((userCredential) => {
          // Signed in 
          console.log(userCredential)
          // const user = userCredential.user;
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name)
        })
        .catch((error) => {
          console.log(error)
          // const errorCode = error.code;
          // const errorMessage = error.message;
          const newUserInfo = { ...user };
          newUserInfo.error = 'something wrong please try again';
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    if (!newUser && user.email && user.password) {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, user.email, user.password)
        .then((userCredential) => {
          // Signed in 
          // const user = userCredential.user;
          // ...
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          console.log('sign in user info: ', userCredential)
        })
        .catch((error) => {
          // const errorCode = error.code;
          // const errorMessage = error.message;
          const newUserInfo = { ...user };
          newUserInfo.error = 'something wrong please try again';
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    e.preventDefault();
  }

  const updateUserName = name => {
    const auth = getAuth();
    updateProfile(auth.currentUser, {
      displayName: name
    }).then(() => {
      console.log('User name update successfully')
    }).catch((error) => {
      console.log(error)
      // An error occurred
      // ...
    });

  }

  const facebookSignIn = () => {
    const provider = new FacebookAuthProvider();
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result)
      })
      .catch((error) => {
        console.log(error)
      });
  } // does not work ):
  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Google sign out</button> : <button onClick={handleSignIn}>Google sign in</button>

      }
      <br />
      <button onClick={facebookSignIn}>Sign in using Facebook</button>
      {
        user.isSignedIn &&
        <div>
          <h1>Welcome, {user.name}</h1>
          <h4>{user.email}</h4>
          <img src={user.photo} alt="" />
        </div>
      }
      <h1>Our own Authentication</h1>
      <input onChange={() => setNewUser(!newUser)} type="checkbox" name="newUser" id="" />
      <label htmlFor="newUser">New User Sign up</label>

      <form>
        {
          newUser && <input onBlur={handleBlur} type="text" name="name" id="" placeholder="Your Name" />
        }
        <br />
        <input onBlur={handleBlur} type="text" name="email" placeholder="Your Email address" id="" required />
        <br />
        <input onBlur={handleBlur} type="password" name="password" placeholder="Your Password" id="" required />
        <br />
        <input onClick={handleSubmit} type="submit" value={newUser ? 'Sign up' : 'Sign In'} />
      </form>
      {
        user.error && <p style={{ color: 'red' }}>{user.error}</p>
      }
      {
        user.success && <p style={{ color: 'green' }}>User {newUser ? "created" : "logged in"}  successfully</p>
      }
    </div>
  );
};

export default App;