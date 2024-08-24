import { auth, provider, signInWithPopup } from "../firebase";
import styles from "../styles/todo-list.module.css";

interface AuthProps {
  user: any;
  setTodos: (todos: any) => void;
  setUser: (user: any) => void;
  setUserLoggedIn: (loggedIn: boolean) => void;
  setLoader: (loading: boolean) => void;
  syncTodosWithServer: (token: string) => void;
}

const Auth: React.FC<AuthProps> = ({ user, setTodos, setUser, setUserLoggedIn, setLoader, syncTodosWithServer }) => {

  const handleLogin = async () => {
    try {
      setLoader(true);
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      const userData = {
        token,
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setUserLoggedIn(true);
      syncTodosWithServer(token);
      setLoader(false);
    } catch (error) {
      console.error("Error logging in:", error);
      setLoader(false);
    }
  };

  const handleLogout = () => {
    setLoader(true);
    auth.signOut();
    setUser(null);
    setTodos([]);
    setUserLoggedIn(false);
    localStorage.removeItem("user");
    localStorage.removeItem("todos");
    setLoader(false);
  };

  return (
    <div className={styles.loginContainer}>
      {!user ? (
        <button className={styles.loginButton} onClick={handleLogin}>
          Login <span className={styles.infoIcon} title="To sync changes, please login now.">ⓘ</span>
        </button>
      ) : (
        <>
          <span className={styles.displayName}>Welcome {user.name}!</span>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </>
      )}
    </div>
  );
};

export default Auth;
