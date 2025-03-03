import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema, loginUserSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";

export default function AuthPage() {
  const { toast } = useToast();
  const { user, login, register } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      toast({
        title: "Logged In",
        description: "Redirecting to dashboard...",
      });
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  if (user) {
    return <div>Redirecting...</div>;
  }

  const loginForm = useForm({
    resolver: zodResolver(loginUserSchema),
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to PropSmart</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form
                  onSubmit={loginForm.handleSubmit(async (data) => {
                    try {
                      await login(data.username, data.password);
                      toast({
                        title: "Login Successful",
                        description: "Welcome back!",
                      });
                    } catch (error) {
                      toast({
                        variant: "destructive",
                        title: "Login Failed",
                        description:
                          "Please check your username and password.",
                      });
                    }
                  })}
                  className="space-y-4 pt-4"
                >
                  <div className="space-y-2">
                    <Input
                      id="login-username"
                      placeholder="Username"
                      {...loginForm.register("username")}
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-sm text-red-500">
                        {loginForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        {...loginForm.register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form
                  onSubmit={registerForm.handleSubmit(async (data) => {
                    try {
                      await register(
                        data.username,
                        data.password,
                        data.name,
                        data.email,
                        data.role
                      );
                      toast({
                        title: "Registration Successful",
                        description: "Your account has been created.",
                      });
                    } catch (error) {
                      toast({
                        variant: "destructive",
                        title: "Registration Failed",
                        description:
                          "There was a problem creating your account.",
                      });
                    }
                  })}
                  className="space-y-4 pt-4"
                >
                  <div className="space-y-2">
                    <Input
                      id="register-username"
                      placeholder="Username"
                      {...registerForm.register("username")}
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        {...registerForm.register("password")}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="register-name"
                      placeholder="Full Name"
                      {...registerForm.register("name")}
                    />
                    {registerForm.formState.errors.name && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Email"
                      {...registerForm.register("email")}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <select
                      {...registerForm.register("role")}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="tenant">Tenant</option>
                      <option value="landlord">Landlord</option>
                    </select>
                    {registerForm.formState.errors.role && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.role.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full">
                    Register
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div className="hidden lg:block bg-gradient-to-br from-primary to-primary-foreground" />
    </div>
  );
}