import { run } from "hardhat";

export const verify = async (contractAddress: string, args: any[]): Promise<void> => {
  console.log("Verifying contract...");

  const verifyArgs = {
    address: contractAddress,
    constructorArguments: args,
    timeout: 60000
  };

  try {
    await run("verify:verify", verifyArgs);
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
};
