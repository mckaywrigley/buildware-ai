import { createProfile, getProfileByUserId, updateProfile } from "@/db/queries/profiles-queries"
import { ProfileCreationError, ProfileNotFoundError, ProfileUpdateError } from "@/errors/profile-errors"
import { db } from "@/db/db"
import { getUserId } from "@/actions/auth/auth"

jest.mock("@/db/db")
jest.mock("@/actions/auth/auth")

describe("Profile Queries", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("createProfile", () => {
    it("should create a profile successfully", async () => {
      const mockUserId = "user123"
      const mockProfile = { id: "profile123", userId: mockUserId }
      ;(getUserId as jest.Mock).mockResolvedValue(mockUserId)
      ;(db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockProfile])
        })
      })

      const result = await createProfile({})
      expect(result).toEqual(mockProfile)
    })

    it("should throw ProfileCreationError on failure", async () => {
      ;(getUserId as jest.Mock).mockResolvedValue("user123")
      ;(db.insert as jest.Mock).mockImplementation(() => {
        throw new Error("Database error")
      })

      await expect(createProfile({})).rejects.toThrow(ProfileCreationError)
    })
  })

  describe("getProfileByUserId", () => {
    it("should return a profile when found", async () => {
      const mockUserId = "user123"
      const mockProfile = { id: "profile123", userId: mockUserId }
      ;(getUserId as jest.Mock).mockResolvedValue(mockUserId)
      ;(db.query.profiles.findFirst as jest.Mock).mockResolvedValue(mockProfile)

      const result = await getProfileByUserId()
      expect(result).toEqual(mockProfile)
    })

    it("should throw ProfileNotFoundError when profile is not found", async () => {
      const mockUserId = "user123"
      ;(getUserId as jest.Mock).mockResolvedValue(mockUserId)
      ;(db.query.profiles.findFirst as jest.Mock).mockResolvedValue(null)

      await expect(getProfileByUserId()).rejects.toThrow(ProfileNotFoundError)
    })
  })

  describe("updateProfile", () => {
    it("should update a profile successfully", async () => {
      const mockUserId = "user123"
      const mockUpdatedProfile = { id: "profile123", userId: mockUserId, name: "Updated Name" }
      ;(getUserId as jest.Mock).mockResolvedValue(mockUserId)
      ;(db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUpdatedProfile])
          })
        })
      })

      const result = await updateProfile({ name: "Updated Name" })
      expect(result).toEqual(mockUpdatedProfile)
    })

    it("should throw ProfileUpdateError on failure", async () => {
      ;(getUserId as jest.Mock).mockResolvedValue("user123")
      ;(db.update as jest.Mock).mockImplementation(() => {
        throw new Error("Database error")
      })

      await expect(updateProfile({ name: "Updated Name" })).rejects.toThrow(ProfileUpdateError)
    })
  })
})