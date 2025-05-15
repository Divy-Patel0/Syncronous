import Background from '@/assets/login2.png';
import Victory from '@/assets/victory.svg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { TabsTrigger } from '@radix-ui/react-tabs';
import React, { useState } from 'react'
import { toast } from 'sonner';
import { isStrongPassword } from 'validator';
import isEmail from 'validator/lib/isEmail';
import { apiClient } from '@/lib/api-client';
import { GENERATE_OTP, LOGIN_ROUTE, SIGNUP_ROUTE, VERIFY_OTP } from '@/utils/constants';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';

function Auth() {

  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const validateLogin = () => {
    if (!email.length) {
      toast.error("Email is required.");
      return false;
    }
    if (!isEmail(email)) {
      toast.error("Enter valid email.");
      return false;
    }
    if (!password.length) {
      toast.error("Password is required.");
      return false;
    }
    if (!isStrongPassword(password)) {
      toast.error("Enter strong password");
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    if (!email.length) {
      toast.error("Email is required.");
      return false;
    }
    if (!isEmail(email)) {
      toast.error("Enter valid email.");
      return false;
    }
    if (!password.length) {
      toast.error("Password is required.");
      return false;
    }
    if (!isStrongPassword(password)) {
      toast.error("Enter strong password");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Password and Confirm Password should be same.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (validateLogin()) {
      try {
        const response = await apiClient.post(
          LOGIN_ROUTE,
          { email, password, },
          { withCredentials: true }
        );

        if (response.data.user.id) {
          setUserInfo(response.data.user)
          if (response.data.user.profileSetup)
            navigate("/chat");
          else
            navigate("/profile");
        }
        console.log({ response });
      }
      catch (error) {
        if (error.response) {
          const { status, data } = error.response;

          if (status === 404) {
            toast.error("User not found.");
          } else if (status === 401) {
            toast.error("Incorrect password.");
          } else {
            toast.error(data.message || "Login failed. Please try again.");
          }
        }
      }
    }
  }

  const handleSendOtp = async () => {
    if (!email.length || !isEmail(email)) {
      toast.error("Enter a valid email to send OTP.");
      return;
    }
    try {
      const response = await apiClient.post(GENERATE_OTP, { email });
      if (response.status === 200) {
        toast.success("OTP sent successfully.");
        setIsOtpSent(true);
      }
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.length) {
      toast.error("Enter the OTP.");
      return;
    }
    try {
      const response = await apiClient.post(VERIFY_OTP, { email, otp });
      if (response.status === 200) {
        toast.success("OTP verified successfully.");
        setIsOtpVerified(true);
      }
    } catch (error) {
      toast.error("Invalid or expired OTP. Please try again.");
    }
  };

  const handleSignup = async () => {
    if (!isOtpVerified) {
      toast.error("Please verify the OTP before signing up.");
      return;
    }
    if (validateSignup()) {
      try {
        const response = await apiClient.post(SIGNUP_ROUTE, {
          email,
          password,
        },
        { withCredentials: true });
        if (response.status === 201) {
          setUserInfo(response.data.user);
          navigate("/profile");
        }
      } catch (error) {
        if (error.response) {
          const { status, data } = error.response;
          if (status === 403) {
            toast.error("User already exists.");
          } else {
            toast.error(data.message || "Signup failed. Please try again.");
          }
        }
      }
    }
  };

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col gap-10 items-center justify-center">
          <div className="flex items-center justify-center flex-col">
            <div className="flex items-center justify-center xl:pr-10px">
              <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
              <img src={Victory} alt="Victory emoji" className="h-[100px]" />
            </div>
            <p className="font-medium text-center">Fill in the details to get started with best chat app!</p>
          </div>
          <div className="flex items-center justify-center w-full">
            <Tabs className='w-3/4' defaultValue='login'>
              <TabsList className="bg-transparent rounded-none w-full">
                <TabsTrigger className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300" value="login">Login</TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300" value="signup">Signup</TabsTrigger>
              </TabsList>
              <TabsContent className="flex flex-col gap-5 mt-5" value="login">
                <Input placeholder="Email"
                  type="email"
                  className="rounded-full p-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} />
                <Input placeholder="Password"
                  type="password"
                  className="rounded-full p-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} />
                <Button className="rounded-full p-6" onClick={handleLogin}>Login</Button>
              </TabsContent>
              <TabsContent className="flex flex-col gap-5" value="signup">
                <Input placeholder="Email"
                  type="email"
                  className="rounded-full p-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} />
                <Input placeholder="Password"
                  type="password"
                  className="rounded-full p-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} />
                <Input placeholder="Confirm Password"
                  type="password"
                  className="rounded-full p-6"
                  value={confirmPassword}
                  onChange={(e) => setconfirmPassword(e.target.value)} />
                {isOtpSent && (
                  <Input placeholder="Enter OTP"
                    type="text"
                    className="rounded-full p-6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)} />
                )}
                {!isOtpSent ? (
                  <Button className="rounded-full p-6" onClick={handleSendOtp}>Send OTP</Button>
                ) : (
                  <Button className="rounded-full p-6" onClick={handleVerifyOtp}>Verify OTP</Button>
                )}
                <Button className="rounded-full p-6" onClick={handleSignup}>Signup</Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="hidden xl:flex justify-center items-center">
          <img src={Background} alt="background image" className='h-[400px] ' />
        </div>
      </div>
    </div>
  )
}

export default Auth