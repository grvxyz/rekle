import { render, screen } from "@testing-library/react";
import App from "./App.jsx";

test("renders navbar brand", () => {
  render(<App />);
  expect(screen.getByText(/REKLE/i)).toBeInTheDocument();
});
